#!/bin/bash
# run: ./run.sh
set -e

echo "starting omnichain..."
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # no color


cd "$(dirname "$0")"
command_exists() {
    command -v "$1" >/dev/null 2>&1
}
echo "checking prerequisites..."
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &>/dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    exit 1
fi

if ! command_exists docker-compose && ! docker compose version &>/dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}Prerequisites check passed!${NC}"
echo ""

echo -e "${YELLOW}Building and starting services...${NC}"
echo ""

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &>/dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Build images first
echo "Building images..."
$DOCKER_COMPOSE build --no-cache

echo ""
echo -e "${GREEN}Images built successfully!${NC}"
echo ""

# Start services
echo "Starting services..."
$DOCKER_COMPOSE up -d

echo ""
echo "================================================"
echo -e "${GREEN}Omnichain now running${NC}"
echo "================================================"
echo ""
echo "Services:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:3001"
echo "  - Hardhat:   http://localhost:8545"
echo "  - Postgres:  localhost:5432"
echo ""
echo "To view logs:"
echo "  $0 logs"
echo ""
echo "To stop services:"
echo "  $0 down"
echo ""

