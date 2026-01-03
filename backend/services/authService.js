/**
 * Auth Service - Handles Authentication with OAuth & Email
 * Supports: Google, GitHub, LinkedIn, and Email/OTP
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

// Database pool will be injected
let db;

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initialize the auth service with database connection
const initAuthService = (dbPool) => {
  db = dbPool;
  return router;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Generate unique username from email or name
 */
const generateUsername = async (email, name) => {
  // Try name-based username first
  let baseUsername = name 
    ? name.toLowerCase().replace(/[^a-z0-9]/g, '')
    : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const exists = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (exists.rows.length === 0) {
      return username;
    }
    
    username = `${baseUsername}${counter}`;
    counter++;
    
    if (counter > 1000) {
      // Fallback to random suffix
      username = `${baseUsername}${crypto.randomBytes(4).toString('hex')}`;
      break;
    }
  }
  
  return username;
};

/**
 * Generate OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Validate corporate email (for HR portal)
 */
const isValidCorporateEmail = (email) => {
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'yandex.com', 'zoho.com', 'gmx.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !personalDomains.includes(domain);
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"AI Interview Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 AI Interview Platform</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Your verification code is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AI Interview Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Auth middleware - Verify JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const result = await db.query(
      'SELECT id, email, username, role, company_domain FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Role-based access middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

/**
 * Corporate email middleware (for HR portal)
 */
const requireCorporateEmail = (req, res, next) => {
  if (!isValidCorporateEmail(req.user.email)) {
    return res.status(403).json({ 
      error: 'Corporate email required',
      message: 'Please use your company email address to access the HR portal.'
    });
  }
  next();
};

// ============================================
// ROUTES
// ============================================

/**
 * POST /auth/register
 * Register with email and password
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'candidate' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Check if recruiter is using corporate email
    if (role === 'recruiter' && !isValidCorporateEmail(email)) {
      return res.status(400).json({ 
        error: 'Corporate email required for recruiters' 
      });
    }
    
    // Check if email exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Generate username
    const username = await generateUsername(email, name);
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Extract company domain for recruiters
    const companyDomain = role === 'recruiter' 
      ? email.split('@')[1].toLowerCase() 
      : null;
    
    // Create user
    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, provider, role, company_domain)
       VALUES ($1, $2, $3, 'email', $4, $5)
       RETURNING id, email, username, role`,
      [email.toLowerCase(), username, passwordHash, role, companyDomain]
    );
    
    const user = result.rows[0];
    
    // Update profile with name
    if (name) {
      await db.query(
        'UPDATE profiles SET full_name = $1 WHERE user_id = $2',
        [name, user.id]
      );
    }
    
    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.query(
      `INSERT INTO user_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET otp = $2, expires_at = $3`,
      [user.id, otp, otpExpires]
    );
    
    // Send verification email
    await sendOTPEmail(email, otp, name);
    
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const result = await db.query(
      `SELECT u.*, p.full_name, p.avatar_url 
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check if user has password (not OAuth-only)
    if (!user.password_hash) {
      return res.status(401).json({ 
        error: 'Please login with your social account',
        provider: user.provider
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name,
        avatar: user.avatar_url,
        role: user.role,
        emailVerified: user.email_verified
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/google
 * Google OAuth login/register
 */
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'candidate' } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if recruiter is using corporate email
    if (role === 'recruiter' && !isValidCorporateEmail(email)) {
      return res.status(400).json({ 
        error: 'Corporate email required',
        message: 'Please use your company Google Workspace account.'
      });
    }
    
    // Check if user exists
    let result = await db.query(
      `SELECT u.*, p.full_name, p.avatar_url 
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );
    
    let user;
    let isNewUser = false;
    
    if (result.rows.length === 0) {
      // Create new user
      isNewUser = true;
      const username = await generateUsername(email, name);
      const companyDomain = role === 'recruiter' ? email.split('@')[1].toLowerCase() : null;
      
      result = await db.query(
        `INSERT INTO users (email, username, provider, provider_id, role, company_domain, email_verified)
         VALUES ($1, $2, 'google', $3, $4, $5, true)
         RETURNING id, email, username, role`,
        [email.toLowerCase(), username, googleId, role, companyDomain]
      );
      
      user = result.rows[0];
      
      // Update profile
      await db.query(
        `UPDATE profiles SET full_name = $1, avatar_url = $2 WHERE user_id = $3`,
        [name, picture, user.id]
      );
      
      user.full_name = name;
      user.avatar_url = picture;
    } else {
      user = result.rows[0];
      
      // Update Google ID if not set (linking accounts)
      if (!user.provider_id && user.provider !== 'google') {
        await db.query(
          `UPDATE users SET provider = 'google', provider_id = $1 WHERE id = $2`,
          [googleId, user.id]
        );
      }
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name,
        avatar: user.avatar_url,
        role: user.role,
        emailVerified: true
      }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

/**
 * POST /auth/github
 * GitHub OAuth login/register
 */
router.post('/github', async (req, res) => {
  try {
    const { code, role = 'candidate' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'GitHub code required' });
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ error: 'Invalid GitHub code' });
    }
    
    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const githubUser = await userResponse.json();
    
    // Fetch email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      });
      
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary);
      email = primaryEmail?.email;
    }
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email required',
        message: 'Please make your email public on GitHub or grant email access.'
      });
    }
    
    // Check if recruiter is using corporate email
    if (role === 'recruiter' && !isValidCorporateEmail(email)) {
      return res.status(400).json({ 
        error: 'Corporate email required for recruiters' 
      });
    }
    
    // Check if user exists
    let result = await db.query(
      `SELECT u.*, p.full_name, p.avatar_url, p.github_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );
    
    let user;
    let isNewUser = false;
    
    if (result.rows.length === 0) {
      // Create new user
      isNewUser = true;
      const username = githubUser.login || await generateUsername(email, githubUser.name);
      const companyDomain = role === 'recruiter' ? email.split('@')[1].toLowerCase() : null;
      
      // Check if username is taken
      const usernameCheck = await db.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );
      
      const finalUsername = usernameCheck.rows.length > 0 
        ? await generateUsername(email, githubUser.name)
        : username;
      
      result = await db.query(
        `INSERT INTO users (email, username, provider, provider_id, role, company_domain, email_verified)
         VALUES ($1, $2, 'github', $3, $4, $5, true)
         RETURNING id, email, username, role`,
        [email.toLowerCase(), finalUsername, githubUser.id.toString(), role, companyDomain]
      );
      
      user = result.rows[0];
      
      // Update profile with GitHub data
      await db.query(
        `UPDATE profiles 
         SET full_name = $1, avatar_url = $2, github_url = $3, bio = $4
         WHERE user_id = $5`,
        [
          githubUser.name,
          githubUser.avatar_url,
          githubUser.html_url,
          githubUser.bio,
          user.id
        ]
      );
      
      user.full_name = githubUser.name;
      user.avatar_url = githubUser.avatar_url;
    } else {
      user = result.rows[0];
      
      // Update GitHub URL if not set
      if (!user.github_url) {
        await db.query(
          `UPDATE profiles SET github_url = $1 WHERE user_id = $2`,
          [githubUser.html_url, user.id]
        );
      }
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name,
        avatar: user.avatar_url,
        role: user.role,
        emailVerified: true
      }
    });
    
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
});

/**
 * POST /auth/send-otp
 * Send OTP to email (for login or verification)
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Find or create user
    let result = await db.query(
      'SELECT id, username FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    let userId;
    let isNewUser = false;
    
    if (result.rows.length === 0) {
      // Create placeholder user
      isNewUser = true;
      const username = await generateUsername(email, null);
      
      result = await db.query(
        `INSERT INTO users (email, username, provider) VALUES ($1, $2, 'email')
         RETURNING id`,
        [email.toLowerCase(), username]
      );
      
      userId = result.rows[0].id;
    } else {
      userId = result.rows[0].id;
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP (using a simple approach - could use Redis for production)
    await db.query(
      `INSERT INTO user_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET otp = $2, expires_at = $3, attempts = 0`,
      [userId, otp, otpExpires]
    );
    
    // Send email
    await sendOTPEmail(email, otp);
    
    res.json({
      message: 'OTP sent successfully',
      isNewUser
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * POST /auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }
    
    // Find user
    const userResult = await db.query(
      `SELECT u.*, p.full_name, p.avatar_url 
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check OTP
    const otpResult = await db.query(
      `SELECT * FROM user_otps 
       WHERE user_id = $1 AND otp = $2 AND expires_at > NOW() AND attempts < 5`,
      [user.id, otp]
    );
    
    if (otpResult.rows.length === 0) {
      // Increment attempts
      await db.query(
        `UPDATE user_otps SET attempts = attempts + 1 WHERE user_id = $1`,
        [user.id]
      );
      
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Mark email as verified
    await db.query(
      'UPDATE users SET email_verified = true, last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Delete OTP
    await db.query('DELETE FROM user_otps WHERE user_id = $1', [user.id]);
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Verification successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name,
        avatar: user.avatar_url,
        role: user.role,
        emailVerified: true
      }
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         u.id, u.email, u.username, u.role, u.email_verified, u.created_at,
         p.full_name, p.avatar_url, p.bio, p.headline, p.skills,
         p.github_url, p.linkedin_url, p.streak_current, p.streak_longest,
         p.problems_solved, p.interviews_completed, p.total_score_avg
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      profile: {
        name: user.full_name,
        avatar: user.avatar_url,
        bio: user.bio,
        headline: user.headline,
        skills: user.skills || [],
        github: user.github_url,
        linkedin: user.linkedin_url,
        streak: {
          current: user.streak_current,
          longest: user.streak_longest
        },
        stats: {
          problemsSolved: user.problems_solved,
          interviewsCompleted: user.interviews_completed,
          averageScore: user.total_score_avg
        }
      }
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const token = generateToken(req.user);
    res.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Export
module.exports = {
  router,
  initAuthService,
  authMiddleware,
  requireRole,
  requireCorporateEmail
};
