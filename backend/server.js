
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Import services
const authService = require('./services/authService');
const jobService = require('./services/jobService');
const { EventPublisher, EventTypes, initEventSystem } = require('./services/eventPublisher');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://cosinv.com",
      "https://www.cosinv.com",
      "https://hr.cosinv.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cosinv:cosinv_secret@localhost:5432/cosinv_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL Connection Error:', err.message);
  } else {
    console.log('✅ PostgreSQL Connected:', res.rows[0].now);
  }
});

// Initialize event system
let eventPublisher;

// Initialize services after event system is ready
const initializeServices = async () => {
  try {
    eventPublisher = await initEventSystem(pool);
    console.log('✅ Event system initialized');
  } catch (error) {
    console.error('⚠️ Event system initialization failed (continuing without events):', error.message);
    eventPublisher = null;
  }
  
  // Initialize service routers with database pool
  authService.initAuthService(pool);
  jobService.initJobService(pool, eventPublisher);
  console.log('✅ Services initialized');
};

// Start initialization
initializeServices();

// Make db and events available to routes
app.set('db', pool);
app.set('eventPublisher', () => eventPublisher);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cosinv.com",
    "https://www.cosinv.com",
    "https://hr.cosinv.com",
    "https://api.cosinv.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('✅ Email Transporter Ready');
  }
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-meeting', (meetingId) => {
    socket.join(meetingId);
    socket.to(meetingId).emit('user-joined', socket.id);
  });

  socket.on('leave-meeting', (meetingId) => {
    socket.leave(meetingId);
    socket.to(meetingId).emit('user-left', socket.id);
  });

  socket.on('send-message', (data) => {
    io.to(data.meetingId).emit('receive-message', data);
  });

  // Interview session events
  socket.on('join-interview', async (sessionId) => {
    socket.join(`interview:${sessionId}`);
    console.log(`Socket ${socket.id} joined interview:${sessionId}`);
  });

  socket.on('interview-event', async (data) => {
    // Broadcast to interview room
    io.to(`interview:${data.sessionId}`).emit('interview-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Routes ---

app.get('/', (req, res) => {
  res.json({ 
    message: 'CosInv AI Interview Platform API',
    version: '2.0.0',
    services: ['auth', 'jobs', 'interviews', 'profiles']
  });
});

// Health check
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    redis: 'unknown'
  };
  
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (e) {
    checks.database = 'error';
  }
  
  if (eventPublisher) {
    checks.redis = 'ok';
  }
  
  res.json(checks);
});

// Mount service routers (initialized in initializeServices)
app.use('/api/auth', authService.router);
app.use('/api', jobService.router);

// Profile API routes
app.get('/api/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.username, u.role, u.created_at,
        p.full_name, p.bio, p.avatar_url, p.github_url, p.linkedin_url,
        p.website_url, p.location, p.skills, p.problems_solved,
        p.interviews_completed, p.total_score_avg, p.current_streak,
        p.longest_streak
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.username = $1
    `, [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Activity data for green chart
app.get('/api/profile/:username/activity', async (req, res) => {
  try {
    const { username } = req.params;
    const { days = 365 } = req.query;
    
    const result = await pool.query(`
      SELECT DATE(a.created_at) as date, COUNT(*) as count
      FROM activity_log a
      JOIN users u ON u.id = a.user_id
      WHERE u.username = $1 
        AND a.created_at > NOW() - INTERVAL '1 day' * $2
      GROUP BY DATE(a.created_at)
      ORDER BY date
    `, [username, parseInt(days)]);
    
    // Transform to { date: count } format
    const activity = {};
    result.rows.forEach(row => {
      activity[row.date.toISOString().split('T')[0]] = parseInt(row.count);
    });
    
    res.json(activity);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Problems API
app.get('/api/problems', async (req, res) => {
  try {
    const { difficulty, company, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT p.id, p.title, p.difficulty, p.acceptance_rate, p.leetcode_url,
             array_agg(DISTINCT c.name) as companies
      FROM problems p
      LEFT JOIN company_problems cp ON cp.problem_id = p.id
      LEFT JOIN companies c ON c.id = cp.company_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (difficulty) {
      params.push(difficulty);
      conditions.push(`p.difficulty = $${params.length}`);
    }
    
    if (company) {
      params.push(company);
      conditions.push(`c.slug = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY p.id ORDER BY p.title';
    params.push(parseInt(limit));
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT p.id) FROM problems p';
    if (company) {
      countQuery += ` 
        LEFT JOIN company_problems cp ON cp.problem_id = p.id
        LEFT JOIN companies c ON c.id = cp.company_id
        WHERE c.slug = $1
      `;
    }
    const countResult = await pool.query(countQuery, company ? [company] : []);
    
    res.json({
      problems: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / parseInt(limit))
    });
  } catch (error) {
    console.error('Problems fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Companies API
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.slug, c.logo_url, c.problem_count
      FROM companies c
      WHERE c.problem_count > 0
      ORDER BY c.problem_count DESC
      LIMIT 100
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// User solutions
app.post('/api/solutions', authService.authMiddleware, async (req, res) => {
  try {
    const { problemId, code, language, status } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(`
      INSERT INTO user_solutions (user_id, problem_id, code, language, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, problem_id) 
      DO UPDATE SET code = $3, language = $4, status = $5, updated_at = NOW()
      RETURNING *
    `, [userId, problemId, code, language, status]);
    
    // Log activity if solved
    if (status === 'solved') {
      await pool.query(`
        INSERT INTO activity_log (user_id, activity_type, problem_id)
        VALUES ($1, 'problem_solved', $2)
        ON CONFLICT DO NOTHING
      `, [userId, problemId]);
      
      // Publish event
      if (eventPublisher) {
        await eventPublisher.publish(EventTypes.PROBLEM_SOLVED, {
          userId,
          problemId
        });
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Solution save error:', error);
    res.status(500).json({ error: 'Failed to save solution' });
  }
});

// Notifications API
app.get('/api/notifications', authService.authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT id, type, title, message, action_url, read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authService.authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await pool.query(`
      UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2
    `, [id, userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Legacy auth routes (kept for backward compatibility)
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name: email.split('@')[0] });
    }
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`DEV OTP for ${email}: ${otp}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Aether Login OTP',
      text: `Your OTP is: ${otp}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>Welcome to Aether</h2>
              <p>Your One-Time Password (OTP) is:</p>
              <h1 style="color: #6d28d9; letter-spacing: 5px;">${otp}</h1>
              <p>This code expires in 10 minutes.</p>
            </div>`
    };

    // await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in login:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: 'Failed to process login' });
  }
});

// 2. Auth: Verify OTP & Create User
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

const { createClient } = require('@deepgram/sdk');

// ... exist code ...

// 3. Deepgram Token Endpoint (Simplified for Development)
app.get('/api/auth/deepgram', async (req, res) => {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error("DEEPGRAM_API_KEY not found in environment variables");
      return res.status(500).json({ error: "Deepgram API key not configured" });
    }

    console.log("Deepgram key endpoint called - returning API key");
    // For development: directly return the API key
    // For production: implement temporary key generation with proper project setup
    res.json({ key: process.env.DEEPGRAM_API_KEY });

  } catch (error) {
    console.error("Error in Deepgram endpoint:", error);
    res.status(500).json({ error: "Failed to get Deepgram key" });
  }
});
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context, code } = req.body;

    // Construct System Prompt
    let systemPrompt = "You are a helpful AI assistant. Answer in 1-2 sentences max.";
    if (context === 'technical-interview') {
      systemPrompt = `You are a technical interviewer. 
      Current Code:
      ${code || "No code."}
      
      Instructions:
      1. Answer the user's question or critique their code.
      2. BE EXTREMELY CONCISE. Respond in 1-2 short sentences only.
      3. Do not lecture. Get straight to the point.
      4. If the user submits code, just say if it's correct and one improvement.
      `;
    }

    const DO_URL = process.env.OLLAMA_BASE_URL || 'https://inference.do-ai.run/v1';
    const DO_MODEL = process.env.OLLAMA_MODEL || 'llama3-8b-instruct';
    const DO_KEY = process.env.OLLAMA_API_KEY;

    console.log(`Processing AI request via DigitalOcean Llama (${DO_MODEL})...`);

    const response = await fetch(`${DO_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DO_KEY}`
      },
      body: JSON.stringify({
        model: DO_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.6,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DigitalOcean API Error [${response.status}]:`, errorText);
      throw new Error(`DigitalOcean API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    console.log("AI Response received successfully");
    res.json({ response: text });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ error: 'AI service error: ' + error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});