# Development Setup Guide

<!-- Commit on 2026-01-27 -->

## Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/cosinv.git
cd cosinv
```

2. Install dependencies:
```bash
# Frontend Main
cd frontend-main && npm install && cd ..

# Frontend HR
cd frontend-hr && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

3. Setup environment variables:
```bash
# Copy example files
cp frontend-main/.env.example frontend-main/.env
cp frontend-hr/.env.example frontend-hr/.env
cp backend/.env.example backend/.env
```

4. Update `.env` files with your configuration

## Running Locally

### Option 1: Docker Compose (Recommended)

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- Frontend Main: http://localhost:5173
- Frontend HR: http://localhost:5174
- Backend API: http://localhost:3000
- Nginx: http://localhost:80

### Option 2: Individual Services

Terminal 1 - Frontend Main:
```bash
cd frontend-main
npm run dev
```

Terminal 2 - Frontend HR:
```bash
cd frontend-hr
npm run dev
```

Terminal 3 - Backend:
```bash
cd backend
npm run dev
```

## Database Setup

```bash
cd backend
npm run migrate
npm run seed  # Load initial data
```

## Debugging

- Use Chrome DevTools for React debugging
- Check `docker-compose logs` for service logs
- Use VS Code debugger for Node.js backend
