# CosInv - AI Interviewer Platform

Multi-frontend architecture with separate candidate and HR portals.

## Architecture

- **frontend-main**: Candidate-facing platform (cosinv.com)
- **frontend-hr**: HR/Recruiter portal (hr.cosinv.com)
- **backend**: Node.js API server
- **interview-engine**: Python-based AI interview service
- **nginx**: Reverse proxy handling routing

## Quick Start

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production  
docker-compose up -d
```

## URLs

- Main Platform: https://cosinv.com
- HR Portal: https://hr.cosinv.com
- API: https://api.cosinv.com
