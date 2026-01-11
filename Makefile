.PHONY: dev dev-web dev-api install clean clean-web clean-api clean-blockchain db-push db-studio build test help

# Default target
help:
	@echo "PrecisionBOM Development Commands"
	@echo ""
	@echo "  make dev          Start all services (web + api)"
	@echo "  make dev-web      Start Next.js web app only"
	@echo "  make dev-api      Start Python agent API only"
	@echo ""
	@echo "  make install      Install all dependencies"
	@echo "  make build        Build all services"
	@echo "  make test         Run all tests"
	@echo ""
	@echo "  make db-push      Push schema to Neon database"
	@echo "  make db-studio    Open Drizzle Studio"
	@echo ""
	@echo "  make clean        Clean all build artifacts"
	@echo "  make clean-web    Clean Next.js artifacts"
	@echo "  make clean-api    Clean Python artifacts"
	@echo ""

# Development
dev:
	@echo "Starting all services..."
	@trap 'kill 0' INT; \
	(cd nextjs-app && npm run dev) & \
	(cd python-agent && uv run uvicorn bom_agent_service.main:app --reload --port 8000) & \
	wait

dev-web:
	cd nextjs-app && npm run dev

dev-api:
	cd python-agent && uv run uvicorn bom_agent_service.main:app --reload --port 8000

# Installation
install: install-web install-api install-blockchain

install-web:
	cd nextjs-app && npm install

install-api:
	cd python-agent && uv sync

install-blockchain:
	cd blockchain && npm install

# Database
db-push:
	cd nextjs-app && npm run db:push

db-studio:
	cd nextjs-app && npm run db:studio

db-generate:
	cd nextjs-app && npm run db:generate

# Build
build: build-web build-blockchain

build-web:
	cd nextjs-app && npm run build

build-blockchain:
	cd blockchain && npx hardhat compile

# Test
test: test-web test-api

test-web:
	cd nextjs-app && npm run lint

test-api:
	cd python-agent && uv run pytest

# Clean
clean: clean-web clean-api clean-blockchain
	@echo "All clean!"

clean-web:
	rm -rf nextjs-app/.next
	rm -rf nextjs-app/node_modules
	rm -rf nextjs-app/drizzle

clean-api:
	rm -rf python-agent/.venv
	rm -rf python-agent/__pycache__
	rm -rf python-agent/src/**/__pycache__
	rm -rf python-agent/.pytest_cache
	rm -rf python-agent/.ruff_cache
	find python-agent -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find python-agent -type f -name "*.pyc" -delete 2>/dev/null || true

clean-blockchain:
	rm -rf blockchain/node_modules
	rm -rf blockchain/artifacts
	rm -rf blockchain/cache
