#!/bin/bash

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

log()    { echo -e "${CYAN}[imgo]${RESET} $1"; }
success(){ echo -e "${GREEN}[imgo]${RESET} $1"; }
warn()   { echo -e "${YELLOW}[imgo]${RESET} $1"; }
error()  { echo -e "${RED}[imgo]${RESET} $1"; exit 1; }

echo ""
echo -e "${BOLD}  Imgo — Self-hosted image processing${RESET}"
echo -e "  ────────────────────────────────────"
echo ""

# ── 1. Docker check ──────────────────────────────────────────────────────────

if ! command -v docker &>/dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi

if ! docker info &>/dev/null; then
  warn "Docker is not running. Attempting to start..."

  if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a Docker
    log "Waiting for Docker to start..."
    for i in $(seq 1 30); do
      if docker info &>/dev/null; then
        break
      fi
      sleep 2
    done
  fi

  if ! docker info &>/dev/null; then
    error "Docker could not be started. Please start Docker manually and re-run this script."
  fi
fi

success "Docker is running"

# ── 2. docker compose check ──────────────────────────────────────────────────

if ! docker compose version &>/dev/null && ! command -v docker-compose &>/dev/null; then
  error "Docker Compose is not available. Update Docker Desktop or install docker-compose."
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &>/dev/null; then
  COMPOSE_CMD="docker-compose"
fi

# ── 3. .env setup ────────────────────────────────────────────────────────────

if [ ! -f ".env" ]; then
  if [ ! -f ".env.example" ]; then
    error ".env.example not found. Are you in the Imgo directory?"
  fi
  cp .env.example .env
  warn ".env created from .env.example"
  warn "Edit .env to configure your environment, then re-run this script."
  echo ""
  exit 0
else
  log ".env found"
fi

# ── 4. Start services ─────────────────────────────────────────────────────────

log "Starting services (MongoDB, Redis, MinIO, Imgo)..."
$COMPOSE_CMD up -d --build

echo ""
log "Waiting for services to be healthy..."

# wait for imgo to respond
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/v1/health/ready &>/dev/null; then
    break
  fi
  sleep 2
done

# ── 5. Status ─────────────────────────────────────────────────────────────────

echo ""
HEALTH=$(curl -sf http://localhost:3000/v1/health/detailed 2>/dev/null || echo "{}")
MONGO=$(echo "$HEALTH" | grep -o '"connected":true' | head -1 | wc -l | tr -d ' ')
REDIS=$(echo "$HEALTH" | grep -o '"connected":true' | tail -1 | wc -l | tr -d ' ')

echo -e "  ${BOLD}Service Status${RESET}"
echo -e "  ──────────────────────────────────────"

if curl -sf http://localhost:3000/v1/health/ready &>/dev/null; then
  echo -e "  Imgo API   ${GREEN}running${RESET}  →  http://localhost:3000"
else
  echo -e "  Imgo API   ${RED}not ready${RESET}"
fi

if [ "$MONGO" = "1" ]; then
  echo -e "  MongoDB    ${GREEN}connected${RESET}"
else
  echo -e "  MongoDB    ${YELLOW}connecting...${RESET}"
fi

if [ "$REDIS" = "1" ]; then
  echo -e "  Redis      ${GREEN}connected${RESET}"
else
  echo -e "  Redis      ${YELLOW}not connected (cache disabled)${RESET}"
fi

echo -e "  MinIO UI   ${CYAN}http://localhost:9001${RESET}  (minioadmin / minioadmin)"

echo ""
echo -e "  ${BOLD}Quick test${RESET}"
echo -e "  ──────────────────────────────────────"
echo -e "  Upload an image:"
echo -e "  ${CYAN}curl -X POST http://localhost:3000/v1/images/upload -F \"image=@photo.jpg\"${RESET}"
echo ""
echo -e "  Serve with transform:"
echo -e "  ${CYAN}curl http://localhost:3000/v1/i/<imageId>?w=300&format=webp${RESET}"
echo ""
echo -e "  Stop:"
echo -e "  ${CYAN}docker compose down${RESET}"
echo ""
