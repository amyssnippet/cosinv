# CosInv - AI-Powered Interview Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker">
</p>

An **Agentic AI Interview Platform** that conducts technical interviews autonomously using Google Gemini, Deepgram voice AI, and real-time code analysis.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Environment Configuration](#-environment-configuration)
- [Docker Setup](#-docker-setup)
- [Cloud Deployment (DigitalOcean)](#-cloud-deployment-digitalocean)
- [GitHub Actions CI/CD](#-github-actions-cicd)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGINX REVERSE PROXY                             │
│                    (SSL Termination, Load Balancing)                        │
│         cosinv.com (Frontend) │ api.cosinv.com (Backend)                    │
└─────────────────┬───────────────────────────────────┬───────────────────────┘
                  │                                   │
    ┌─────────────▼─────────────┐     ┌──────────────▼──────────────┐
    │     REACT FRONTEND        │     │     NODE.JS BACKEND         │
    │   (Vite + Tailwind CSS)   │     │   (Express + Socket.IO)     │
    │                           │     │                              │
    │ • Landing Page            │     │ • Auth Service (OAuth/OTP)   │
    │ • Dashboard               │     │ • Job Service               │
    │ • Interview Arena         │     │ • Profile API               │
    │ • HR Portal               │     │ • Problems API              │
    │ • Profile Page            │     │ • WebSocket Gateway         │
    └───────────────────────────┘     └──────────────┬───────────────┘
                                                     │
                            ┌────────────────────────┼────────────────────────┐
                            │                        │                        │
              ┌─────────────▼─────────────┐   ┌──────▼──────┐   ┌────────────▼────────────┐
              │   INTERVIEW ENGINE        │   │   REDIS     │   │      POSTGRESQL         │
              │   (Python FastAPI)        │   │  (Pub/Sub)  │   │      (Database)         │
              │                           │   │             │   │                         │
              │ • AI Interview Agent      │   │ • Events    │   │ • Users & Profiles      │
              │ • Gemini 1.5 Flash       │   │ • Caching   │   │ • Problems (200+ cos)   │
              │ • Code Analysis          │   │ • Sessions  │   │ • Jobs & Applications   │
              │ • Proctoring Events      │   │             │   │ • Interview Sessions    │
              │ • Score Calculation      │   │             │   │ • Activity Logs         │
              └───────────────────────────┘   └─────────────┘   └─────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
    ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
    │  GEMINI   │ │ DEEPGRAM  │ │  GOOGLE   │
    │  1.5 Flash│ │  Nova-2   │ │   TTS     │
    │  (LLM)    │ │  (STT)    │ │  (Voice)  │
    └───────────┘ └───────────┘ └───────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 6 | Build Tool |
| Tailwind CSS 4 | Styling |
| CodeMirror | Code Editor |
| Zustand | State Management |
| Socket.IO Client | Real-time Communication |
| Three.js | 3D Backgrounds |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 20 | Runtime |
| Express.js | HTTP Server |
| Socket.IO | WebSocket Server |
| PostgreSQL 16 | Primary Database |
| Redis 7 | Message Queue & Cache |
| JWT | Authentication |

### AI Services
| Service | Purpose |
|---------|---------|
| Google Gemini 1.5 Flash | LLM for Interview AI |
| Deepgram Nova-2 | Speech-to-Text |
| Google Cloud TTS | Text-to-Speech |

### Interview Engine (Python)
| Technology | Purpose |
|------------|---------|
| Python 3.11 | Runtime |
| FastAPI | HTTP/WebSocket Server |
| google-generativeai | Gemini SDK |
| asyncpg | PostgreSQL Driver |

---

## 📁 Project Structure

```
ai-interviewer/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Main CI/CD pipeline
│       ├── db-migrations.yml      # Database migrations
│       └── ingest-problems.yml    # Problem ingestion
├── backend/
│   ├── database/
│   │   └── schema.sql             # PostgreSQL schema
│   ├── scripts/
│   │   └── ingest_problems.py     # Problem ingestion script
│   ├── services/
│   │   ├── authService.js         # OAuth + Email OTP
│   │   ├── jobService.js          # Job CRUD + Applications
│   │   ├── interview_engine.py    # AI Interview Agent
│   │   └── eventPublisher.js      # Redis events
│   ├── server.js                  # Main Express server
│   ├── Dockerfile                 # Node.js container
│   ├── Dockerfile.python          # Python container
│   ├── package.json
│   ├── requirements.txt
│   ├── .env.example
│   └── .env.local                 # Local environment
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── GreenChart.tsx     # Activity heatmap
│   │   ├── pages/
│   │   │   ├── ProfilePage.tsx    # /u/{username}
│   │   │   ├── InterviewArena.tsx # Interview UI
│   │   │   └── HRPortal.tsx       # HR Dashboard
│   │   └── App.tsx                # Router + Main App
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── leetcode-companywise-interview-questions/
│   └── {company}/                 # 200+ company folders
│       └── *.csv                  # Problem CSVs
├── docker-compose.yml             # Production stack
├── docker-compose.dev.yml         # Development (DB only)
└── README.md
```

---

## 💻 Local Development

### Prerequisites

- Node.js 20.x
- Python 3.11+
- Docker & Docker Compose
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ai-interviewer.git
cd ai-interviewer
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis only
docker compose -f docker-compose.dev.yml up -d

# Verify services are running
docker ps

# Check logs if needed
docker compose -f docker-compose.dev.yml logs -f
```

### 3. Configure Environment

```bash
# Copy and edit environment file
cp backend/.env.example backend/.env.local

# Edit with your API keys
nano backend/.env.local
```

### 4. Start Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.local .env

# Start development server
npm run dev
```

### 5. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. Access Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Interview Engine | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### 7. (Optional) Start Debug Tools

```bash
# Start with pgAdmin and Redis Commander
docker compose -f docker-compose.dev.yml --profile debug up -d
```

| Tool | URL | Credentials |
|------|-----|-------------|
| pgAdmin | http://localhost:5050 | admin@cosinv.com / admin123 |
| Redis Commander | http://localhost:8081 | N/A |

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create `backend/.env.local` with the following:

```env
# Server
NODE_ENV=development
PORT=5000

# Database (Docker defaults)
DATABASE_URL=postgresql://cosinv:cosinv_secret@localhost:5432/cosinv_db
POSTGRES_USER=cosinv
POSTGRES_PASSWORD=cosinv_secret
POSTGRES_DB=cosinv_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# AI Services
GEMINI_API_KEY=xxx          # https://aistudio.google.com
GOOGLE_API_KEY=xxx
DEEPGRAM_API_KEY=xxx        # https://console.deepgram.com

# Email (SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=xxx
EMAIL_PASS=xxx
EMAIL_FROM=noreply@cosinv.com
```

---

## 🐳 Docker Setup

### Development (Database Only)

```bash
# Start PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Remove volumes (reset database)
docker compose -f docker-compose.dev.yml down -v
```

### Production (Full Stack)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart backend

# Stop all services
docker compose down
```

### Container Overview

| Container | Port | Description |
|-----------|------|-------------|
| cosinv-postgres | 5432 | PostgreSQL 16 database |
| cosinv-redis | 6379 | Redis 7 cache/queue |
| cosinv-backend | 5000 | Node.js API server |
| cosinv-interview-engine | 8000 | Python AI engine |
| cosinv-nginx | 80, 443 | Reverse proxy |

---

## ☁️ Cloud Deployment (DigitalOcean)

### Prerequisites

1. **DigitalOcean Droplet** (minimum 2GB RAM, 2 vCPU)
2. **Domain** pointing to your droplet IP
3. **GitHub repository** with secrets configured

### Step 1: Create DigitalOcean Droplet

```bash
# Create droplet via doctl CLI
doctl compute droplet create cosinv-prod \
  --image docker-20-04 \
  --size s-2vcpu-4gb \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID
```

Or use DigitalOcean Dashboard:
1. Go to [DigitalOcean](https://cloud.digitalocean.com)
2. Create → Droplets → Docker on Ubuntu
3. Choose 2GB/2vCPU plan ($24/mo)
4. Add your SSH key
5. Create Droplet

### Step 2: Configure DNS

Point your domains to the droplet IP:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_DROPLET_IP |
| A | api | YOUR_DROPLET_IP |
| A | hr | YOUR_DROPLET_IP |

### Step 3: Initial Server Setup

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP

# Create app directory
mkdir -p /opt/cosinv
cd /opt/cosinv

# Create required directories
mkdir -p backend/database ssl webroot

# Docker with compose plugin should be pre-installed on Docker droplet image
# Verify with: docker compose version
```

### Step 4: Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description |
|-------------|-------------|
| `DO_HOST` | Your droplet IP address |
| `DO_USERNAME` | `root` (or your user) |
| `DO_SSH_KEY` | Private SSH key content |
| `POSTGRES_USER` | `cosinv` |
| `POSTGRES_PASSWORD` | Strong password |
| `POSTGRES_DB` | `cosinv_db` |
| `JWT_SECRET` | Random 64-char string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GH_OAUTH_CLIENT_ID` | GitHub OAuth client ID |
| `GH_OAUTH_CLIENT_SECRET` | GitHub OAuth secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_API_KEY` | Google Cloud API key |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | From email address |
| `VITE_API_URL` | `https://api.cosinv.com` |

### Step 5: Deploy via GitHub Actions

Push to main branch to trigger deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The CI/CD pipeline will:
1. ✅ Run lint and tests
2. ✅ Build Docker images
3. ✅ Push to GitHub Container Registry
4. ✅ SSH to DigitalOcean droplet
5. ✅ Pull and deploy new containers

### Step 6: SSL Certificate Setup

SSH into droplet and run:

```bash
cd /opt/cosinv

# Get SSL certificates
docker run --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/webroot:/var/www/html \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/html \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d cosinv.com \
  -d api.cosinv.com \
  -d hr.cosinv.com

# Restart nginx to apply SSL
docker compose restart nginx
```

### Step 7: Verify Deployment

```bash
# Check all containers are running
docker ps

# Check health endpoint
curl https://api.cosinv.com/health

# View logs
docker compose logs -f backend
```

---

## 🔄 GitHub Actions CI/CD

### Workflows

#### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Triggered on push to `main`:
- Runs linting and tests
- Builds Docker images
- Pushes to GitHub Container Registry
- Deploys to DigitalOcean

#### 2. Database Migrations (`.github/workflows/db-migrations.yml`)

Triggered when `backend/database/**` changes:
- Applies schema changes to production database

#### 3. Problem Ingestion (`.github/workflows/ingest-problems.yml`)

Manual trigger:
- Ingests LeetCode problems from CSV files
- Can target specific company or all companies

### Manual Deployment

Trigger from GitHub Actions tab:
1. Go to Actions → CI/CD Pipeline
2. Click "Run workflow"
3. Select branch and run

---

## 📡 API Reference

### Authentication

```http
POST /api/auth/oauth/google    # Google OAuth
POST /api/auth/oauth/github    # GitHub OAuth
POST /api/auth/otp/send        # Send email OTP
POST /api/auth/otp/verify      # Verify OTP
```

### Jobs

```http
GET    /api/jobs               # List jobs (with filters)
GET    /api/jobs/:id           # Get job details
POST   /api/jobs               # Create job (HR only)
PUT    /api/jobs/:id           # Update job
DELETE /api/jobs/:id           # Delete job
POST   /api/jobs/:id/apply     # Apply to job
```

### Profiles

```http
GET /api/profile/:username           # Get public profile
GET /api/profile/:username/activity  # Get activity data
```

### Problems

```http
GET /api/problems              # List problems (paginated)
GET /api/companies             # List companies
```

### Health Check

```http
GET /health                    # Service health status
```

---

## 🗄 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `profiles` | Extended user profiles |
| `problems` | LeetCode problems |
| `companies` | Company info |
| `company_problems` | Problem-company mapping |
| `jobs` | Job postings |
| `applications` | Job applications |
| `interview_sessions` | Interview records |
| `interview_events` | Proctoring events |
| `activity_log` | User activity |
| `notifications` | User notifications |

### Key Features

- **UUID primary keys** for security
- **Automatic timestamps** via triggers
- **Streak calculation** via triggers
- **Optimized indexes** for common queries

---

## 🔧 Troubleshooting

### Container Issues

```bash
# View all container logs
docker compose logs

# Restart specific container
docker compose restart backend

# Rebuild containers
docker compose up -d --build --force-recreate
```

### Database Issues

```bash
# Access PostgreSQL CLI
docker exec -it cosinv-postgres psql -U cosinv -d cosinv_db

# Reset database (WARNING: deletes all data)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

### Redis Issues

```bash
# Access Redis CLI
docker exec -it cosinv-redis redis-cli

# Clear all Redis data
docker exec -it cosinv-redis redis-cli FLUSHALL
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

<p align="center">
  Built with ❤️ by the Amol Yadav
</p># Commit 1
# Commit 2
# Commit 3
# Commit 4
# Commit 5
# Commit 6
# Commit 7
# Commit 8
# Commit 9
# Commit 10
# Commit 11
