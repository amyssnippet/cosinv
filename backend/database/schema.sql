-- ============================================
-- AGENTIC AI INTERVIEW PLATFORM - DATABASE SCHEMA
-- PostgreSQL Schema for Microservices Architecture
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SERVICE: AUTH & USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Null if OAuth
    provider VARCHAR(20) DEFAULT 'email', -- 'google', 'github', 'linkedin', 'email'
    provider_id VARCHAR(255), -- OAuth provider user ID
    role VARCHAR(20) DEFAULT 'candidate', -- 'candidate', 'recruiter', 'admin'
    company_domain VARCHAR(100), -- populated if role is recruiter
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- ============================================
-- SERVICE: PROFILES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    headline VARCHAR(255), -- e.g., "Software Engineer at Google"
    location VARCHAR(100),
    skills TEXT[], -- Array of strings ['React', 'Java', 'Python']
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    resume_url TEXT,
    resume_parsed JSONB, -- Auto-extracted data from resume
    
    -- Streak & Activity Stats
    streak_current INT DEFAULT 0,
    streak_longest INT DEFAULT 0,
    problems_solved INT DEFAULT 0,
    interviews_completed INT DEFAULT 0,
    total_score_avg DECIMAL(5,2) DEFAULT 0,
    
    -- Privacy Settings
    profile_public BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);

-- ============================================
-- SERVICE: PROBLEMS & CONTENT
-- ============================================

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leetcode_id INT UNIQUE, -- Original LeetCode ID
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    url TEXT,
    difficulty VARCHAR(20) NOT NULL, -- 'Easy', 'Medium', 'Hard'
    acceptance_rate DECIMAL(5,2),
    frequency DECIMAL(5,2), -- Company frequency percentage
    company_tags TEXT[], -- ['Google', 'Amazon', 'Meta']
    topic_tags TEXT[], -- ['Array', 'Dynamic Programming', 'Tree']
    description TEXT, -- Problem description (scraped or manual)
    examples JSONB, -- Input/Output examples
    constraints TEXT[],
    starter_code JSONB, -- { "python": "def solution():", "java": "class Solution {}" }
    test_cases JSONB, -- [{ "input": "...", "output": "...", "hidden": false }]
    hints TEXT[],
    solution_approach TEXT, -- For AI reference
    time_complexity VARCHAR(50), -- Expected O() notation
    space_complexity VARCHAR(50),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_company_tags ON problems USING GIN(company_tags);
CREATE INDEX idx_problems_topic_tags ON problems USING GIN(topic_tags);
CREATE INDEX idx_problems_leetcode_id ON problems(leetcode_id);

-- Company-specific problem frequency tracking
CREATE TABLE company_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(100) NOT NULL,
    company_slug VARCHAR(100) NOT NULL,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    frequency DECIMAL(5,2), -- Company-specific frequency
    last_asked DATE,
    times_asked INT DEFAULT 1,
    time_period VARCHAR(50), -- 'thirty_days', 'six_months', 'all_time'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_slug, problem_id, time_period)
);

CREATE INDEX idx_company_problems_company ON company_problems(company_slug);
CREATE INDEX idx_company_problems_frequency ON company_problems(frequency DESC);

-- ============================================
-- SERVICE: ACTIVITY LOG (For Green Chart)
-- ============================================

CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'problem_solved', 'interview_completed', 'practice_session'
    activity_date DATE DEFAULT CURRENT_DATE,
    problem_id UUID REFERENCES problems(id),
    details JSONB, -- Additional context
    points_earned INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user_date ON activity_log(user_id, activity_date);
CREATE INDEX idx_activity_type ON activity_log(activity_type);

-- User problem solutions (track what users have solved)
CREATE TABLE user_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'attempted', -- 'attempted', 'solved', 'optimized'
    language VARCHAR(50),
    code TEXT,
    runtime_ms INT,
    memory_mb DECIMAL(6,2),
    runtime_percentile DECIMAL(5,2),
    memory_percentile DECIMAL(5,2),
    attempts INT DEFAULT 1,
    first_solved_at TIMESTAMP,
    last_attempt_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, problem_id, language)
);

CREATE INDEX idx_user_solutions_user ON user_solutions(user_id);
CREATE INDEX idx_user_solutions_status ON user_solutions(status);

-- ============================================
-- SERVICE: JOBS
-- ============================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(100), -- company.com
    logo_url TEXT,
    description TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- '1-50', '51-200', '201-500', '500+'
    headquarters VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_domain ON companies(domain);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    requirements TEXT[],
    responsibilities TEXT[],
    skills_required TEXT[],
    experience_min INT DEFAULT 0, -- Years
    experience_max INT,
    salary_min INT, -- Annual salary
    salary_max INT,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    location VARCHAR(100),
    location_type VARCHAR(20) DEFAULT 'hybrid', -- 'remote', 'onsite', 'hybrid'
    employment_type VARCHAR(20) DEFAULT 'full-time', -- 'full-time', 'part-time', 'contract', 'internship'
    
    -- Interview Configuration
    interview_rounds INT DEFAULT 3,
    ai_interview_enabled BOOLEAN DEFAULT TRUE,
    problem_pool UUID[], -- Array of problem IDs for this job
    interview_duration_mins INT DEFAULT 45,
    
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'open', 'paused', 'closed'
    applications_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    
    posted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills_required);

-- ============================================
-- SERVICE: APPLICATIONS
-- ============================================

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'applied', 
    -- 'applied', 'screening', 'ai_interview', 'hr_review', 'final_round', 'offered', 'rejected', 'withdrawn'
    
    cover_letter TEXT,
    resume_url TEXT,
    
    -- AI Interview Results
    ai_interview_completed BOOLEAN DEFAULT FALSE,
    ai_score_total INT, -- 0 to 100
    ai_score_technical INT,
    ai_score_behavioral INT,
    ai_score_communication INT,
    
    -- HR Notes
    recruiter_notes TEXT,
    recruiter_rating INT, -- 1-5 stars
    
    applied_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================
-- SERVICE: INTERVIEWS & METRICS
-- ============================================

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id), -- Null if practice mode
    application_id UUID REFERENCES applications(id),
    problem_id UUID REFERENCES problems(id),
    
    session_type VARCHAR(20) DEFAULT 'practice', -- 'practice', 'job_interview', 'assessment'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'abandoned'
    
    -- Timing
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INT,
    
    -- Code Submission
    language VARCHAR(50),
    final_code TEXT,
    code_runtime_ms INT,
    code_memory_mb DECIMAL(6,2),
    test_cases_passed INT,
    test_cases_total INT,
    
    -- AI METRICS (The "LeetCode + AI" Judging)
    score_total INT, -- 0 to 100 (weighted average)
    score_technical INT, -- 40% weight: correctness, complexity analysis
    score_code_quality INT, -- 20% weight: naming, structure, modularity
    score_communication INT, -- 20% weight: explanation, hints response
    score_behavioral INT, -- 20% weight: integrity, approach
    
    -- Detailed Breakdown
    metrics JSONB, -- Detailed scoring breakdown
    ai_feedback TEXT, -- AI generated feedback
    strengths TEXT[],
    improvements TEXT[],
    
    -- Proctoring & Integrity
    cheating_flag BOOLEAN DEFAULT FALSE,
    cheating_reasons TEXT[],
    tab_switch_count INT DEFAULT 0,
    copy_paste_count INT DEFAULT 0,
    voice_anomaly_detected BOOLEAN DEFAULT FALSE,
    face_detection_issues INT DEFAULT 0,
    
    -- Recordings & Transcripts
    transcript_url TEXT,
    recording_url TEXT,
    chat_history JSONB, -- Full conversation with AI
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interview_sessions_candidate ON interview_sessions(candidate_id);
CREATE INDEX idx_interview_sessions_job ON interview_sessions(job_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_sessions_score ON interview_sessions(score_total DESC);

-- Interview events timeline
CREATE TABLE interview_events (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'started', 'code_run', 'code_submit', 'ai_hint', 'tab_switch', etc.
    event_data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interview_events_session ON interview_events(session_id);

-- ============================================
-- SERVICE: LEARNING & ROADMAPS (LMS)
-- ============================================

CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL, -- "Google SDE Interview Prep - Java"
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    company_focus VARCHAR(100), -- 'Google', 'Amazon', etc.
    language_focus VARCHAR(50), -- 'Java', 'Python', etc.
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    estimated_hours INT,
    modules JSONB, -- Array of module objects
    problem_ids UUID[], -- Ordered list of problems
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    current_module INT DEFAULT 0,
    problems_completed INT DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(user_id, roadmap_id)
);

-- ============================================
-- SERVICE: NOTIFICATIONS & EVENTS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'interview_reminder', 'application_update', 'new_job_match'
    title VARCHAR(255),
    message TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Event queue for microservices communication
CREATE TABLE event_queue (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_event_queue_status ON event_queue(status, created_at);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_profile_on_user_insert AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity DATE;
    current_streak INT;
    longest_streak INT;
BEGIN
    SELECT MAX(activity_date) INTO last_activity
    FROM activity_log
    WHERE user_id = NEW.user_id AND activity_date < NEW.activity_date;
    
    SELECT streak_current, streak_longest INTO current_streak, longest_streak
    FROM profiles WHERE user_id = NEW.user_id;
    
    IF last_activity = NEW.activity_date - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        current_streak := current_streak + 1;
    ELSIF last_activity = NEW.activity_date THEN
        -- Same day, no change
        NULL;
    ELSE
        -- Streak broken, reset to 1
        current_streak := 1;
    END IF;
    
    IF current_streak > longest_streak THEN
        longest_streak := current_streak;
    END IF;
    
    UPDATE profiles
    SET streak_current = current_streak, streak_longest = longest_streak
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_streak_on_activity AFTER INSERT ON activity_log
    FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- ============================================
-- SEED DATA: Initial Admin User
-- ============================================

-- Note: Run this after deployment with actual password hash
-- INSERT INTO users (username, email, password_hash, role, email_verified)
-- VALUES ('admin', 'admin@example.com', 'HASH_HERE', 'admin', true);
