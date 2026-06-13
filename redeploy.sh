#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  SwapStore — Redeploy Script (post-merge)
#  Pulls latest, installs deps, rebuilds, restarts PM2
# ─────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ECOSYSTEM_FILE="$ROOT_DIR/ecosystem.config.cjs"

# ── Colors ──────────────────────────────────────────────────
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Pre-flight checks ──────────────────────────────────────
command -v pnpm >/dev/null 2>&1 || err "pnpm is not installed."
command -v pm2  >/dev/null 2>&1 || err "pm2 is not installed."
command -v git  >/dev/null 2>&1 || err "git is not installed."

if [ ! -f "$ECOSYSTEM_FILE" ]; then
  err "ecosystem.config.cjs not found. Run ./deploy.sh first for initial setup."
fi

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     🔄 SwapStore Redeploy                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

cd "$ROOT_DIR"

# ── Step 1: Git Pull ───────────────────────────────────────
echo -e "${BOLD}[1/4] 📥 Pulling latest changes...${NC}"
BEFORE_HASH=$(git rev-parse HEAD)
git pull
AFTER_HASH=$(git rev-parse HEAD)

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  info "Already up to date ($BEFORE_HASH)"
else
  log "Updated: $(git log --oneline ${BEFORE_HASH}..${AFTER_HASH} | wc -l) new commit(s)"
  git log --oneline "${BEFORE_HASH}..${AFTER_HASH}"
fi
echo ""

# ── Step 2: Install Dependencies ──────────────────────────
echo -e "${BOLD}[2/4] 📦 Installing dependencies...${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
log "Dependencies installed"
echo ""

# ── Step 3: Build Client & Admin ──────────────────────────
echo -e "${BOLD}[3/4] 🔨 Building apps...${NC}"
pnpm --filter client build:staging
log "Client built"
pnpm --filter admin build:staging
log "Admin built"
echo ""

# ── Step 4: Restart PM2 ──────────────────────────────────
echo -e "${BOLD}[4/4] 🚀 Restarting PM2 services...${NC}"
pm2 restart "$ECOSYSTEM_FILE"
log "All services restarted"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║      ✅ Redeploy Complete!                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

pm2 status
