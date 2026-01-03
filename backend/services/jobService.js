/**
 * Job Service - Handles Job Postings and Applications
 * Features: CRUD operations, filtering, event publishing
 */

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, requireCorporateEmail } = require('./authService');

let db;
let eventPublisher; // For Redis/RabbitMQ events

const initJobService = (dbPool, publisher = null) => {
  db = dbPool;
  eventPublisher = publisher;
  return router;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Publish event to message queue
 */
const publishEvent = async (eventType, payload) => {
  if (eventPublisher) {
    try {
      await eventPublisher.publish(eventType, payload);
    } catch (error) {
      console.error('Event publish error:', error);
    }
  }
  
  // Also store in database event queue for reliability
  await db.query(
    `INSERT INTO event_queue (event_type, payload) VALUES ($1, $2)`,
    [eventType, JSON.stringify(payload)]
  );
};

/**
 * Build dynamic filter query
 */
const buildFilterQuery = (filters) => {
  const conditions = ['j.status = $1'];
  const params = ['open'];
  let paramCount = 1;
  
  if (filters.search) {
    paramCount++;
    conditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount})`);
    params.push(`%${filters.search}%`);
  }
  
  if (filters.location) {
    paramCount++;
    conditions.push(`j.location ILIKE $${paramCount}`);
    params.push(`%${filters.location}%`);
  }
  
  if (filters.locationType) {
    paramCount++;
    conditions.push(`j.location_type = $${paramCount}`);
    params.push(filters.locationType);
  }
  
  if (filters.employmentType) {
    paramCount++;
    conditions.push(`j.employment_type = $${paramCount}`);
    params.push(filters.employmentType);
  }
  
  if (filters.experienceMin !== undefined) {
    paramCount++;
    conditions.push(`j.experience_min >= $${paramCount}`);
    params.push(filters.experienceMin);
  }
  
  if (filters.experienceMax !== undefined) {
    paramCount++;
    conditions.push(`j.experience_max <= $${paramCount}`);
    params.push(filters.experienceMax);
  }
  
  if (filters.skills && filters.skills.length > 0) {
    paramCount++;
    conditions.push(`j.skills_required && $${paramCount}`);
    params.push(filters.skills);
  }
  
  if (filters.companyId) {
    paramCount++;
    conditions.push(`j.company_id = $${paramCount}`);
    params.push(filters.companyId);
  }
  
  if (filters.aiInterviewEnabled !== undefined) {
    paramCount++;
    conditions.push(`j.ai_interview_enabled = $${paramCount}`);
    params.push(filters.aiInterviewEnabled);
  }
  
  return { conditions, params, paramCount };
};

// ============================================
// PUBLIC ROUTES (Candidate Portal)
// ============================================

/**
 * GET /jobs
 * List all open jobs with filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      locationType,
      employmentType,
      experienceMin,
      experienceMax,
      skills,
      companyId,
      aiInterviewEnabled,
      sortBy = 'posted_at',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      search,
      location,
      locationType,
      employmentType,
      experienceMin: experienceMin ? parseInt(experienceMin) : undefined,
      experienceMax: experienceMax ? parseInt(experienceMax) : undefined,
      skills: skills ? skills.split(',') : undefined,
      companyId,
      aiInterviewEnabled: aiInterviewEnabled !== undefined ? aiInterviewEnabled === 'true' : undefined
    };
    
    const { conditions, params, paramCount } = buildFilterQuery(filters);
    
    // Validate sort column
    const validSortColumns = ['posted_at', 'title', 'salary_max', 'applications_count'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'posted_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM jobs j WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    
    // Get paginated results
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await db.query(
      `SELECT 
         j.id, j.title, j.description, j.requirements, j.skills_required,
         j.experience_min, j.experience_max, j.salary_min, j.salary_max, j.salary_currency,
         j.location, j.location_type, j.employment_type,
         j.ai_interview_enabled, j.interview_rounds, j.interview_duration_mins,
         j.applications_count, j.posted_at,
         c.name as company_name, c.slug as company_slug, c.logo_url as company_logo,
         c.industry as company_industry
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY j.${sortColumn} ${order}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, parseInt(limit), offset]
    );
    
    // Increment view count for each job (batch update)
    const jobIds = result.rows.map(j => j.id);
    if (jobIds.length > 0) {
      await db.query(
        `UPDATE jobs SET views_count = views_count + 1 WHERE id = ANY($1)`,
        [jobIds]
      );
    }
    
    res.json({
      jobs: result.rows.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description?.substring(0, 300) + (job.description?.length > 300 ? '...' : ''),
        requirements: job.requirements,
        skills: job.skills_required,
        experience: {
          min: job.experience_min,
          max: job.experience_max
        },
        salary: {
          min: job.salary_min,
          max: job.salary_max,
          currency: job.salary_currency
        },
        location: job.location,
        locationType: job.location_type,
        employmentType: job.employment_type,
        interview: {
          aiEnabled: job.ai_interview_enabled,
          rounds: job.interview_rounds,
          duration: job.interview_duration_mins
        },
        applicationsCount: job.applications_count,
        postedAt: job.posted_at,
        company: {
          name: job.company_name,
          slug: job.company_slug,
          logo: job.company_logo,
          industry: job.company_industry
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /jobs/:id
 * Get job details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT 
         j.*,
         c.name as company_name, c.slug as company_slug, c.logo_url as company_logo,
         c.description as company_description, c.website as company_website,
         c.industry as company_industry, c.size as company_size, c.headquarters as company_hq,
         u.username as recruiter_username
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company_id
       LEFT JOIN users u ON u.id = j.recruiter_id
       WHERE j.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = result.rows[0];
    
    // Get related problems if any
    let problems = [];
    if (job.problem_pool && job.problem_pool.length > 0) {
      const problemsResult = await db.query(
        `SELECT id, title, difficulty, company_tags 
         FROM problems WHERE id = ANY($1)`,
        [job.problem_pool]
      );
      problems = problemsResult.rows;
    }
    
    // Increment view count
    await db.query(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1',
      [id]
    );
    
    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      skills: job.skills_required,
      experience: {
        min: job.experience_min,
        max: job.experience_max
      },
      salary: {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.salary_currency
      },
      location: job.location,
      locationType: job.location_type,
      employmentType: job.employment_type,
      interview: {
        aiEnabled: job.ai_interview_enabled,
        rounds: job.interview_rounds,
        duration: job.interview_duration_mins,
        problemCount: job.problem_pool?.length || 0
      },
      status: job.status,
      applicationsCount: job.applications_count,
      viewsCount: job.views_count,
      postedAt: job.posted_at,
      expiresAt: job.expires_at,
      company: {
        id: job.company_id,
        name: job.company_name,
        slug: job.company_slug,
        logo: job.company_logo,
        description: job.company_description,
        website: job.company_website,
        industry: job.company_industry,
        size: job.company_size,
        headquarters: job.company_hq
      },
      recruiter: job.recruiter_username
    });
    
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * POST /jobs/:id/apply
 * Apply to a job
 */
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter, resumeUrl } = req.body;
    const candidateId = req.user.id;
    
    // Check if job exists and is open
    const jobResult = await db.query(
      `SELECT id, title, status, company_id FROM jobs WHERE id = $1`,
      [id]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];
    
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }
    
    // Check if already applied
    const existingApplication = await db.query(
      `SELECT id FROM applications WHERE candidate_id = $1 AND job_id = $2`,
      [candidateId, id]
    );
    
    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }
    
    // Create application
    const result = await db.query(
      `INSERT INTO applications (candidate_id, job_id, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, status, applied_at`,
      [candidateId, id, coverLetter, resumeUrl]
    );
    
    // Increment applications count
    await db.query(
      `UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1`,
      [id]
    );
    
    // Publish event
    await publishEvent('application.created', {
      applicationId: result.rows[0].id,
      jobId: id,
      candidateId,
      companyId: job.company_id
    });
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        appliedAt: result.rows[0].applied_at
      }
    });
    
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

/**
 * GET /jobs/my-applications
 * Get candidate's applications
 */
router.get('/my/applications', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const candidateId = req.user.id;
    
    let conditions = ['a.candidate_id = $1'];
    let params = [candidateId];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      conditions.push(`a.status = $${paramCount}`);
      params.push(status);
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await db.query(
      `SELECT 
         a.id, a.status, a.ai_score_total, a.ai_interview_completed, a.applied_at,
         j.id as job_id, j.title as job_title, j.location, j.location_type,
         c.name as company_name, c.logo_url as company_logo
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.applied_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, parseInt(limit), offset]
    );
    
    const countResult = await db.query(
      `SELECT COUNT(*) FROM applications a WHERE ${conditions.join(' AND ')}`,
      params
    );
    
    res.json({
      applications: result.rows.map(app => ({
        id: app.id,
        status: app.status,
        aiScore: app.ai_score_total,
        aiInterviewCompleted: app.ai_interview_completed,
        appliedAt: app.applied_at,
        job: {
          id: app.job_id,
          title: app.job_title,
          location: app.location,
          locationType: app.location_type
        },
        company: {
          name: app.company_name,
          logo: app.company_logo
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
    
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ============================================
// HR ROUTES (Recruiter Portal)
// ============================================

/**
 * POST /jobs
 * Create a new job posting
 */
router.post('/', authMiddleware, requireRole('recruiter', 'admin'), requireCorporateEmail, async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      responsibilities,
      skillsRequired,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      salaryCurrency,
      location,
      locationType,
      employmentType,
      interviewRounds,
      aiInterviewEnabled,
      interviewDuration,
      problemPool,
      expiresAt
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    
    // Get recruiter's company
    const companyResult = await db.query(
      `SELECT id FROM companies WHERE domain = $1`,
      [req.user.company_domain]
    );
    
    let companyId;
    if (companyResult.rows.length === 0) {
      // Create company automatically
      const newCompany = await db.query(
        `INSERT INTO companies (name, slug, domain)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          req.user.company_domain.split('.')[0],
          req.user.company_domain.replace('.', '-'),
          req.user.company_domain
        ]
      );
      companyId = newCompany.rows[0].id;
    } else {
      companyId = companyResult.rows[0].id;
    }
    
    const result = await db.query(
      `INSERT INTO jobs (
         recruiter_id, company_id, title, description, requirements, responsibilities,
         skills_required, experience_min, experience_max,
         salary_min, salary_max, salary_currency,
         location, location_type, employment_type,
         interview_rounds, ai_interview_enabled, interview_duration_mins,
         problem_pool, expires_at, status, posted_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'open', NOW())
       RETURNING id, title, status, posted_at`,
      [
        req.user.id,
        companyId,
        title,
        description,
        requirements,
        responsibilities,
        skillsRequired,
        experienceMin || 0,
        experienceMax,
        salaryMin,
        salaryMax,
        salaryCurrency || 'USD',
        location,
        locationType || 'hybrid',
        employmentType || 'full-time',
        interviewRounds || 3,
        aiInterviewEnabled !== false,
        interviewDuration || 45,
        problemPool,
        expiresAt
      ]
    );
    
    const job = result.rows[0];
    
    // Publish event for real-time sync
    await publishEvent('job.created', {
      jobId: job.id,
      companyId,
      recruiterId: req.user.id,
      title: job.title
    });
    
    res.status(201).json({
      message: 'Job created successfully',
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        postedAt: job.posted_at
      }
    });
    
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * PUT /jobs/:id
 * Update job posting
 */
router.put('/:id', authMiddleware, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Verify ownership
    const jobResult = await db.query(
      `SELECT recruiter_id, company_id FROM jobs WHERE id = $1`,
      [id]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (jobResult.rows[0].recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }
    
    // Build update query dynamically
    const allowedFields = [
      'title', 'description', 'requirements', 'responsibilities',
      'skills_required', 'experience_min', 'experience_max',
      'salary_min', 'salary_max', 'salary_currency',
      'location', 'location_type', 'employment_type',
      'interview_rounds', 'ai_interview_enabled', 'interview_duration_mins',
      'problem_pool', 'status', 'expires_at'
    ];
    
    const setClauses = [];
    const params = [];
    let paramCount = 0;
    
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        paramCount++;
        setClauses.push(`${snakeKey} = $${paramCount}`);
        params.push(value);
      }
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    paramCount++;
    params.push(id);
    
    await db.query(
      `UPDATE jobs SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
      params
    );
    
    // Publish event
    await publishEvent('job.updated', {
      jobId: id,
      updates: Object.keys(updates)
    });
    
    res.json({ message: 'Job updated successfully' });
    
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

/**
 * GET /jobs/hr/my-jobs
 * Get recruiter's job postings
 */
router.get('/hr/my-jobs', authMiddleware, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let conditions = ['j.recruiter_id = $1'];
    let params = [req.user.id];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      conditions.push(`j.status = $${paramCount}`);
      params.push(status);
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await db.query(
      `SELECT 
         j.id, j.title, j.status, j.applications_count, j.views_count,
         j.posted_at, j.expires_at,
         c.name as company_name
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY j.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      jobs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /jobs/:id/candidates
 * Get candidates for a job (HR view)
 */
router.get('/:id/candidates', authMiddleware, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      minScore,
      maxScore,
      sortBy = 'ai_score_total',
      sortOrder = 'desc'
    } = req.query;
    
    // Verify ownership
    const jobResult = await db.query(
      `SELECT recruiter_id FROM jobs WHERE id = $1`,
      [id]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (jobResult.rows[0].recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    let conditions = ['a.job_id = $1'];
    let params = [id];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      conditions.push(`a.status = $${paramCount}`);
      params.push(status);
    }
    
    if (minScore) {
      paramCount++;
      conditions.push(`a.ai_score_total >= $${paramCount}`);
      params.push(parseInt(minScore));
    }
    
    if (maxScore) {
      paramCount++;
      conditions.push(`a.ai_score_total <= $${paramCount}`);
      params.push(parseInt(maxScore));
    }
    
    const validSortColumns = ['ai_score_total', 'applied_at', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'ai_score_total';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await db.query(
      `SELECT 
         a.id, a.status, a.ai_score_total, a.ai_score_technical, 
         a.ai_score_behavioral, a.ai_score_communication,
         a.ai_interview_completed, a.recruiter_rating, a.recruiter_notes,
         a.applied_at,
         u.id as candidate_id, u.email as candidate_email, u.username,
         p.full_name, p.avatar_url, p.headline, p.skills,
         p.problems_solved, p.streak_current,
         (SELECT COUNT(*) FROM interview_sessions WHERE candidate_id = u.id AND cheating_flag = true) as cheating_incidents
       FROM applications a
       JOIN users u ON u.id = a.candidate_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.${sortColumn} ${order} NULLS LAST
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, parseInt(limit), offset]
    );
    
    const countResult = await db.query(
      `SELECT COUNT(*) FROM applications a WHERE ${conditions.join(' AND ')}`,
      params
    );
    
    res.json({
      candidates: result.rows.map(c => ({
        applicationId: c.id,
        status: c.status,
        appliedAt: c.applied_at,
        scores: {
          total: c.ai_score_total,
          technical: c.ai_score_technical,
          behavioral: c.ai_score_behavioral,
          communication: c.ai_score_communication
        },
        aiInterviewCompleted: c.ai_interview_completed,
        recruiterRating: c.recruiter_rating,
        recruiterNotes: c.recruiter_notes,
        cheatingIncidents: parseInt(c.cheating_incidents),
        candidate: {
          id: c.candidate_id,
          email: c.candidate_email,
          username: c.username,
          name: c.full_name,
          avatar: c.avatar_url,
          headline: c.headline,
          skills: c.skills,
          stats: {
            problemsSolved: c.problems_solved,
            currentStreak: c.streak_current
          }
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
    
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/**
 * PUT /jobs/:jobId/candidates/:appId/status
 * Update application status
 */
router.put('/:jobId/candidates/:appId/status', authMiddleware, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { jobId, appId } = req.params;
    const { status, notes, rating } = req.body;
    
    // Verify ownership
    const jobResult = await db.query(
      `SELECT recruiter_id FROM jobs WHERE id = $1`,
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (jobResult.rows[0].recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const validStatuses = [
      'applied', 'screening', 'ai_interview', 'hr_review', 
      'final_round', 'offered', 'rejected', 'withdrawn'
    ];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const setClauses = ['last_activity_at = NOW()'];
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      setClauses.push(`status = $${paramCount}`);
      params.push(status);
    }
    
    if (notes !== undefined) {
      paramCount++;
      setClauses.push(`recruiter_notes = $${paramCount}`);
      params.push(notes);
    }
    
    if (rating !== undefined) {
      paramCount++;
      setClauses.push(`recruiter_rating = $${paramCount}`);
      params.push(rating);
    }
    
    paramCount++;
    params.push(appId);
    
    await db.query(
      `UPDATE applications SET ${setClauses.join(', ')} WHERE id = $${paramCount}`,
      params
    );
    
    // Get candidate info for notification
    const appResult = await db.query(
      `SELECT candidate_id FROM applications WHERE id = $1`,
      [appId]
    );
    
    if (appResult.rows.length > 0 && status) {
      // Create notification for candidate
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, action_url)
         VALUES ($1, 'application_update', $2, $3, $4)`,
        [
          appResult.rows[0].candidate_id,
          'Application Status Updated',
          `Your application status has been updated to: ${status}`,
          `/applications/${appId}`
        ]
      );
      
      // Publish event
      await publishEvent('application.status_updated', {
        applicationId: appId,
        jobId,
        candidateId: appResult.rows[0].candidate_id,
        newStatus: status
      });
    }
    
    res.json({ message: 'Application updated successfully' });
    
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

module.exports = { initJobService };
