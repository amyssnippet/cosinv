# Deployment Guide

<!-- Commit on 2026-01-27 -->

## Docker Deployment

### Building Images

```bash
# Frontend Main
docker build -t cosinv-frontend-main ./frontend-main

# Frontend HR
docker build -t cosinv-frontend-hr ./frontend-hr

# Nginx
docker build -t cosinv-nginx ./nginx
```

### Running with Docker Compose

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

## Environment Setup

1. Copy `.env.example` to `.env` in each frontend directory
2. Update API URLs and credentials
3. Build and run containers

## SSL/TLS Configuration

- Development: Self-signed certificates (auto-generated)
- Production: Let's Encrypt via certbot

## Health Checks

- Frontend Main: `http://localhost/health`
- Frontend HR: `http://localhost/health`
- API: `http://localhost:3000/health`

## Monitoring

- Check logs: `docker-compose logs [service]`
- Monitor performance: Use Docker stats

## Rollback

To revert to previous version:

```bash
docker-compose down
docker-compose up -d
```
