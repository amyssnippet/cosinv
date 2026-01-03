#!/bin/bash

# CosInv AI Interview Platform - Quick Start Script
# Usage: ./scripts/start-dev.sh

set -e

echo "🚀 Starting CosInv Development Environment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose plugin is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check for .env.local
if [ ! -f "backend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  No .env.local found. Creating from example...${NC}"
    cp backend/.env.example backend/.env.local
    echo -e "${YELLOW}📝 Please edit backend/.env.local with your API keys${NC}"
fi

# Start database services
echo ""
echo "📦 Starting PostgreSQL and Redis..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check PostgreSQL
if docker exec cosinv-postgres pg_isready -U cosinv -d cosinv_db > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready. Check logs: docker logs cosinv-postgres${NC}"
fi

# Check Redis
if docker exec cosinv-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready. Check logs: docker logs cosinv-redis${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Database services are running!${NC}"
echo "============================================"
echo ""
echo "Connection Details:"
echo "  PostgreSQL: localhost:5432"
echo "    User: cosinv"
echo "    Pass: cosinv_secret"
echo "    DB:   cosinv_db"
echo ""
echo "  Redis: localhost:6379"
echo ""
echo "Next Steps:"
echo "  1. Terminal 1 - Backend:"
echo "     cd backend && npm install && npm run dev"
echo ""
echo "  2. Terminal 2 - Frontend:"
echo "     cd frontend && npm install && npm run dev"
echo ""
echo "  3. Open http://localhost:5173 in your browser"
echo ""
echo "To stop databases:"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
