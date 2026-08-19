#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  SwapStore — Production Deployment Script
#  Installs deps, builds client & admin, runs all 3 via PM2
# ─────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ECOSYSTEM_FILE="$ROOT_DIR/ecosystem.config.cjs"

# ── Colors ──────────────────────────────────────────────────
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Pre-flight checks ──────────────────────────────────────
command -v pnpm >/dev/null 2>&1 || err "pnpm is not installed. Install it: npm i -g pnpm"
command -v pm2  >/dev/null 2>&1 || err "pm2 is not installed. Install it: npm i -g pm2"
command -v npx  >/dev/null 2>&1 || err "npx is not available."

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     🚀 SwapStore Deployment v1.1.0       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Port Input ──────────────────────────────────────────────
validate_port() {
  local port="$1"
  local name="$2"
  if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1024 ] || [ "$port" -gt 65535 ]; then
    err "Invalid port for $name: $port (must be 1024–65535)"
  fi
}

check_port_conflict() {
  local port="$1"
  local name="$2"
  if lsof -i :"$port" >/dev/null 2>&1; then
    warn "Port $port ($name) is already in use!"
    read -rp "   Continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      err "Aborted. Free port $port and try again."
    fi
  fi
}

echo -e "${BOLD}Configure Ports:${NC}"
echo ""

read -rp "  🖥️  Server API port   [default: 4000]: " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-4000}
validate_port "$SERVER_PORT" "Server"

read -rp "  🌐 Client app port   [default: 3000]: " CLIENT_PORT
CLIENT_PORT=${CLIENT_PORT:-3000}
validate_port "$CLIENT_PORT" "Client"

read -rp "  🔐 Admin panel port  [default: 3001]: " ADMIN_PORT
ADMIN_PORT=${ADMIN_PORT:-3001}
validate_port "$ADMIN_PORT" "Admin"

# Check for duplicate ports
if [ "$SERVER_PORT" = "$CLIENT_PORT" ] || [ "$SERVER_PORT" = "$ADMIN_PORT" ] || [ "$CLIENT_PORT" = "$ADMIN_PORT" ]; then
  err "All three ports must be different! Got: Server=$SERVER_PORT, Client=$CLIENT_PORT, Admin=$ADMIN_PORT"
fi

echo ""
info "Ports configured → Server: $SERVER_PORT | Client: $CLIENT_PORT | Admin: $ADMIN_PORT"
echo ""

# Check if ports are in use
check_port_conflict "$SERVER_PORT" "Server"
check_port_conflict "$CLIENT_PORT" "Client"
check_port_conflict "$ADMIN_PORT" "Admin"

# ── Step 1: Install Dependencies ───────────────────────────
echo ""
echo -e "${BOLD}[1/4] 📦 Installing dependencies...${NC}"
cd "$ROOT_DIR"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
log "Dependencies installed"

# ── Step 2: Build Client ───────────────────────────────────
echo ""
echo -e "${BOLD}[2/4] 🔨 Building client app...${NC}"
pnpm --filter client build
log "Client built → apps/client/dist/"

# ── Step 3: Build Admin ────────────────────────────────────
echo ""
echo -e "${BOLD}[3/4] 🔨 Building admin panel...${NC}"
pnpm --filter admin build
log "Admin built → apps/admin/dist/"

# ── Step 4: Generate PM2 Ecosystem & Start ─────────────────
echo ""
echo -e "${BOLD}[4/4] 🚀 Starting services with PM2...${NC}"

# Stop existing swapstore processes if any
pm2 delete swapstore-server swapstore-client swapstore-admin 2>/dev/null || true

# Generate PM2 ecosystem config
cat > "$ECOSYSTEM_FILE" << EOF
module.exports = {
  apps: [
    {
      name: 'swapstore-server',
      cwd: '${ROOT_DIR}/apps/server',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: ${SERVER_PORT},
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '${ROOT_DIR}/logs/server-error.log',
      out_file: '${ROOT_DIR}/logs/server-out.log',
      time: true,
    },
    {
      name: 'swapstore-client',
      cwd: '${ROOT_DIR}/apps/client',
      script: 'npx',
      args: 'serve dist -l ${CLIENT_PORT} -s',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: '${ROOT_DIR}/logs/client-error.log',
      out_file: '${ROOT_DIR}/logs/client-out.log',
      time: true,
    },
    {
      name: 'swapstore-admin',
      cwd: '${ROOT_DIR}/apps/admin',
      script: 'node_modules/.bin/serve',
      args: 'dist -l ${ADMIN_PORT} -s',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: '${ROOT_DIR}/logs/admin-error.log',
      out_file: '${ROOT_DIR}/logs/admin-out.log',
      time: true,
    },
  ],
};
EOF

# Create logs directory
mkdir -p "$ROOT_DIR/logs"

# Start all services
pm2 start "$ECOSYSTEM_FILE"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        ✅ Deployment Complete!            ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════╣${NC}"
echo -e "║  🖥️  Server:  ${GREEN}http://localhost:${SERVER_PORT}${NC}"
echo -e "║  🌐 Client:  ${GREEN}http://localhost:${CLIENT_PORT}${NC}"
echo -e "║  🔐 Admin:   ${GREEN}http://localhost:${ADMIN_PORT}${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════╣${NC}"
echo -e "║  📋 PM2 commands:                        ║"
echo -e "║     ${CYAN}pm2 status${NC}         → view processes  ║"
echo -e "║     ${CYAN}pm2 logs${NC}           → stream all logs  ║"
echo -e "║     ${CYAN}pm2 restart all${NC}    → restart services ║"
echo -e "║     ${CYAN}pm2 stop all${NC}       → stop services    ║"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# Show PM2 status
pm2 status
