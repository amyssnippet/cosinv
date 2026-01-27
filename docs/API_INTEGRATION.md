# API Integration Guide

<!-- Commit on 2026-01-27 -->

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.cosinv.com`

## Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new account
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Jobs
- `GET /jobs` - List all jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs/:id/apply` - Apply for job

### Interviews
- `GET /interviews` - List user interviews
- `POST /interviews` - Schedule interview
- `GET /interviews/:id` - Get interview details
- `POST /interviews/:id/submit` - Submit interview code

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user
