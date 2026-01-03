/**
 * Event Publisher - Redis-based message queue for microservices communication
 * Handles job syncing, notifications, and real-time updates
 */

const Redis = require('ioredis');

class EventPublisher {
  constructor(redisUrl) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.subscriber = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.handlers = new Map();
    
    this.redis.on('connect', () => {
      console.log('📡 Redis Publisher connected');
    });
    
    this.redis.on('error', (err) => {
      console.error('Redis Publisher error:', err);
    });
    
    this.subscriber.on('connect', () => {
      console.log('📡 Redis Subscriber connected');
    });
  }

  /**
   * Publish an event to a channel
   */
  async publish(eventType, payload) {
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };
    
    try {
      await this.redis.publish(`events:${eventType}`, JSON.stringify(message));
      
      // Also store in a list for reliability (in case subscribers are down)
      await this.redis.lpush(`queue:${eventType}`, JSON.stringify(message));
      await this.redis.ltrim(`queue:${eventType}`, 0, 999); // Keep last 1000 messages
      
      console.log(`📤 Published event: ${eventType}`);
      return message.id;
    } catch (error) {
      console.error('Publish error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to an event channel
   */
  async subscribe(eventType, handler) {
    const channel = `events:${eventType}`;
    
    // Store handler
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
    }
    this.handlers.get(channel).push(handler);
    
    // Subscribe to channel
    await this.subscriber.subscribe(channel);
    
    // Handle incoming messages
    this.subscriber.on('message', async (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message);
          const handlers = this.handlers.get(channel) || [];
          
          for (const h of handlers) {
            await h(parsed);
          }
        } catch (error) {
          console.error('Message handling error:', error);
        }
      }
    });
    
    console.log(`📥 Subscribed to: ${eventType}`);
  }

  /**
   * Process pending messages from queue (for reliability)
   */
  async processPendingMessages(eventType, handler, batchSize = 10) {
    const queueKey = `queue:${eventType}`;
    
    while (true) {
      const messages = await this.redis.lrange(queueKey, -batchSize, -1);
      
      if (messages.length === 0) {
        break;
      }
      
      for (const message of messages) {
        try {
          const parsed = JSON.parse(message);
          await handler(parsed);
          await this.redis.lrem(queueKey, 1, message);
        } catch (error) {
          console.error('Pending message processing error:', error);
        }
      }
    }
  }

  /**
   * Close connections
   */
  async close() {
    await this.redis.quit();
    await this.subscriber.quit();
    console.log('Redis connections closed');
  }
}

// Event Types
const EventTypes = {
  // Job Events
  JOB_CREATED: 'job.created',
  JOB_UPDATED: 'job.updated',
  JOB_DELETED: 'job.deleted',
  JOB_STATUS_CHANGED: 'job.status_changed',
  
  // Application Events
  APPLICATION_CREATED: 'application.created',
  APPLICATION_STATUS_UPDATED: 'application.status_updated',
  
  // Interview Events
  INTERVIEW_STARTED: 'interview.started',
  INTERVIEW_COMPLETED: 'interview.completed',
  INTERVIEW_SCORE_UPDATED: 'interview.score_updated',
  
  // User Events
  USER_REGISTERED: 'user.registered',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  
  // Activity Events
  PROBLEM_SOLVED: 'activity.problem_solved',
  STREAK_UPDATED: 'activity.streak_updated',
  
  // Notification Events
  NOTIFICATION_SEND: 'notification.send'
};

// Event Handlers Factory
const createEventHandlers = (db) => ({
  // Handle job created - sync to candidate portal
  [EventTypes.JOB_CREATED]: async (event) => {
    console.log(`📌 Processing job.created: ${event.payload.jobId}`);
    // In a real microservices setup, this would update a separate database
    // For now, we'll create a notification
    try {
      // Notify relevant candidates (matching skills)
      const { jobId, title, companyId } = event.payload;
      
      // Get candidates with matching skills
      const job = await db.query(
        'SELECT skills_required FROM jobs WHERE id = $1',
        [jobId]
      );
      
      if (job.rows.length > 0 && job.rows[0].skills_required) {
        const matchingCandidates = await db.query(
          `SELECT u.id FROM users u
           JOIN profiles p ON p.user_id = u.id
           WHERE u.role = 'candidate' 
           AND p.skills && $1
           LIMIT 100`,
          [job.rows[0].skills_required]
        );
        
        // Create notifications for matching candidates
        for (const candidate of matchingCandidates.rows) {
          await db.query(
            `INSERT INTO notifications (user_id, type, title, message, action_url)
             VALUES ($1, 'new_job_match', $2, $3, $4)`,
            [
              candidate.id,
              'New Job Match!',
              `A new position "${title}" matches your skills.`,
              `/jobs/${jobId}`
            ]
          );
        }
        
        console.log(`📬 Notified ${matchingCandidates.rows.length} candidates about new job`);
      }
    } catch (error) {
      console.error('Job created handler error:', error);
    }
  },
  
  // Handle application created - notify recruiter
  [EventTypes.APPLICATION_CREATED]: async (event) => {
    console.log(`📌 Processing application.created: ${event.payload.applicationId}`);
    
    try {
      const { applicationId, jobId, candidateId } = event.payload;
      
      // Get job and recruiter info
      const jobResult = await db.query(
        `SELECT j.title, j.recruiter_id, u.email as candidate_email, p.full_name as candidate_name
         FROM jobs j
         JOIN users u ON u.id = $1
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE j.id = $2`,
        [candidateId, jobId]
      );
      
      if (jobResult.rows.length > 0) {
        const { title, recruiter_id, candidate_name } = jobResult.rows[0];
        
        // Notify recruiter
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, action_url)
           VALUES ($1, 'new_application', $2, $3, $4)`,
          [
            recruiter_id,
            'New Application',
            `${candidate_name || 'A candidate'} applied for ${title}`,
            `/hr/jobs/${jobId}/candidates`
          ]
        );
      }
    } catch (error) {
      console.error('Application created handler error:', error);
    }
  },
  
  // Handle interview completed - update application and notify
  [EventTypes.INTERVIEW_COMPLETED]: async (event) => {
    console.log(`📌 Processing interview.completed: ${event.payload.sessionId}`);
    
    try {
      const { sessionId, candidateId, jobId, scores } = event.payload;
      
      if (jobId) {
        // Update application with AI scores
        await db.query(
          `UPDATE applications 
           SET ai_interview_completed = true,
               ai_score_total = $1,
               ai_score_technical = $2,
               ai_score_behavioral = $3,
               ai_score_communication = $4,
               status = 'hr_review',
               last_activity_at = NOW()
           WHERE candidate_id = $5 AND job_id = $6`,
          [
            scores.total,
            scores.technical,
            scores.behavioral,
            scores.communication,
            candidateId,
            jobId
          ]
        );
        
        // Notify candidate
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, action_url)
           VALUES ($1, 'interview_completed', $2, $3, $4)`,
          [
            candidateId,
            'Interview Completed',
            `Your AI interview has been completed. Score: ${scores.total}%`,
            `/applications`
          ]
        );
      }
      
      // Update profile stats
      await db.query(
        `UPDATE profiles 
         SET interviews_completed = interviews_completed + 1,
             total_score_avg = (
               SELECT AVG(score_total) FROM interview_sessions 
               WHERE candidate_id = $1 AND score_total IS NOT NULL
             )
         WHERE user_id = $1`,
        [candidateId]
      );
      
    } catch (error) {
      console.error('Interview completed handler error:', error);
    }
  },
  
  // Handle problem solved - update activity and streaks
  [EventTypes.PROBLEM_SOLVED]: async (event) => {
    console.log(`📌 Processing problem_solved: ${event.payload.userId}`);
    
    try {
      const { userId, problemId } = event.payload;
      
      // Log activity (trigger will update streak)
      await db.query(
        `INSERT INTO activity_log (user_id, activity_type, problem_id)
         VALUES ($1, 'problem_solved', $2)
         ON CONFLICT DO NOTHING`,
        [userId, problemId]
      );
      
      // Update problems_solved count
      await db.query(
        `UPDATE profiles 
         SET problems_solved = (
           SELECT COUNT(DISTINCT problem_id) FROM user_solutions 
           WHERE user_id = $1 AND status = 'solved'
         )
         WHERE user_id = $1`,
        [userId]
      );
      
    } catch (error) {
      console.error('Problem solved handler error:', error);
    }
  }
});

// Initialize and export
const initEventSystem = async (db) => {
  const publisher = new EventPublisher();
  const handlers = createEventHandlers(db);
  
  // Subscribe to all event types
  for (const [eventType, handler] of Object.entries(handlers)) {
    await publisher.subscribe(eventType, handler);
    
    // Process any pending messages
    await publisher.processPendingMessages(eventType, handler);
  }
  
  return publisher;
};

module.exports = {
  EventPublisher,
  EventTypes,
  initEventSystem
};
