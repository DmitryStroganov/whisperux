# Makefile for Whisper Transcriber Container Management
# Provides simplified commands for dev and prod deployments

.PHONY: help all dev prod clean logs restart stop start build prod-build

# Default target
all: help

help:
	@echo "Whisper Transcriber Container Management"
	@echo ""
	@echo "Development Mode (Local Frontend + Containerized Backend)"
	@echo "  make dev              - Start dev server with backend container"
	@echo "  make dev-stop         - Stop dev server and backend"
	@echo ""
	@echo "Production Mode (Containerized Frontend + Backend)"
	@echo "  make prod-build       - Build production React container image"
	@echo "  make prod             - Build and start production containers in pod"
	@echo "  make prod-stop        - Stop production containers"
	@echo "  make prod-restart     - Restart production containers"
	@echo ""
	@echo "Container Operations"
	@echo "  make logs             - Show container logs"
	@echo "  make clean            - Clean build artifacts and containers"

# ============================================
# Development Mode
# ============================================

dev:
	@echo "Starting development mode..."
	@echo "  - Frontend: Local npm run dev on port 3000"
	@echo "  - Backend: Podman container on port 8005"
	@echo "  - Press Ctrl+C to stop"
	@echo ""
	@podman run -d \
		--name whisper-server-dev \
		-p 8005:9000 \
		-e WHISPER_MODEL=tiny.en \
		-e WHISPER_API_KEY= \
		docker.io/hwdsl2/whisper-server
	@echo "Backend container started: whisper-server-dev"
	@echo "Starting frontend dev server..."
	npm run dev

dev-stop:
	@echo "Stopping development containers..."
	@podman stop whisper-server-dev 2>/dev/null || true
	@podman rm whisper-server-dev 2>/dev/null || true
	@echo "Development containers stopped"

# ============================================
# Production Build
# ============================================

prod-build:
	@echo "Building production React container image..."
	podman build -t whisper-ux:latest -f podmanfile .
	@echo "Image built: whisper-ux:latest"

# ============================================
# Production Mode
# ============================================

prod: prod-build
	@echo "Starting production mode..."
	@echo "  - Frontend: whisper-ux container on port 8080"
	@echo "  - Backend: whisper-server container on port 8005"
	@echo "  - Press Ctrl+C to stop"
	@echo ""
	@podman play kube etc/podman-play.yaml
	@echo "Production containers started"

prod-stop:
	@echo "Stopping production pod..."
	@podman pod stop whisper-pod 2>/dev/null || true
	@podman pod rm whisper-pod 2>/dev/null || true
	@echo "Production pod stopped (all containers removed)"

prod-restart:
	@echo "Restarting production containers..."
	@podman restart whisper-ux 2>/dev/null || true
	@podman restart whisper-server 2>/dev/null || true
	@echo "Production containers restarted"

# ============================================
# Container Operations
# ============================================

logs:
	@echo "=== whisper-ux logs ==="
	@podman logs -f whisper-ux 2>/dev/null || echo "whisper-ux not running"
	@echo ""
	@echo "=== whisper-server logs ==="
	@podman logs -f whisper-server 2>/dev/null || echo "whisper-server not running"

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build node_modules/.vite dist .eslintcache
	@echo "Cleaning containers..."
	@podman stop whisper-server-dev 2>/dev/null || true
	@podman stop whisper-ux 2>/dev/null || true
	@podman stop whisper-server 2>/dev/null || true
	@podman stop whisper-pod 2>/dev/null || true
	@podman rm whisper-server-dev 2>/dev/null || true
	@podman rm whisper-ux 2>/dev/null || true
	@podman rm whisper-server 2>/dev/null || true
	@podman rm whisper-pod 2>/dev/null || true
	@echo "Cleanup complete"

# ============================================
# Podman Compose Support
# ============================================

compose-up:
	@echo "Starting with podman-compose..."
	@podman-compose -f etc/podman-compose.yml up -d

compose-down:
	@echo "Stopping podman-compose..."
	@podman-compose -f etc/podman-compose.yml down

compose-restart:
	@echo "Restarting with podman-compose..."
	@podman-compose -f etc/podman-compose.yml restart
