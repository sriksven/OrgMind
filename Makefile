# Makefile for OrgMind project

.PHONY: help install install-dev test test-backend test-frontend dev dev-backend dev-frontend clean lint format

# Default target
help:
	@echo "OrgMind - AI Chief of Staff"
	@echo ""
	@echo "Available targets:"
	@echo "  install        - Install all dependencies"
	@echo "  install-dev    - Install development dependencies"
	@echo "  dev            - Run both backend and frontend in development mode"
	@echo "  dev-backend    - Run backend development server"
	@echo "  dev-frontend   - Run frontend development server"
	@echo "  test           - Run all tests"
	@echo "  test-backend   - Run backend tests"
	@echo "  test-frontend  - Run frontend tests"
	@echo "  lint           - Run linters"
	@echo "  format         - Format code"
	@echo "  clean          - Clean generated files"
	@echo ""

# Installation
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Installation complete!"

install-dev:
	@echo "📦 Installing development dependencies..."
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm install
	@echo "✅ Development dependencies installed!"

# Development
dev:
	@echo "🚀 Starting OrgMind in development mode..."
	@echo "   Backend: http://127.0.0.1:8000"
	@echo "   Frontend: http://localhost:5174"
	@echo ""
	@echo "   Press Ctrl+C to stop"
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "🐍 Starting backend..."
	cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	@echo "⚛️  Starting frontend..."
	cd frontend && npm run dev

# Testing
test: test-backend test-frontend

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && pytest -v

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

# Code Quality
lint:
	@echo "🔍 Linting backend..."
	cd backend && flake8 src tests
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint

format:
	@echo "✨ Formatting backend code..."
	cd backend && black src tests
	cd backend && isort src tests
	@echo "✨ Formatting frontend code..."
	cd frontend && npm run format

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".coverage" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	cd frontend && rm -rf dist .vite 2>/dev/null || true
	@echo "✅ Cleanup complete!"

# Data
load-data:
	@echo "📊 Loading data into knowledge graph..."
	cd backend && python scripts/load_real_data.py
	@echo "✅ Data loaded!"

# Build
build-frontend:
	@echo "🏗️  Building frontend..."
	cd frontend && npm run build
	@echo "✅ Frontend build complete!"

# Quick status check
status:
	@echo "📊 OrgMind Status"
	@echo "=================="
	@curl -s http://127.0.0.1:8000/health | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'Backend: {d[\"status\"]}'); print(f'Nodes: {d[\"graph\"][\"nodes_total\"]}'); print(f'Edges: {d[\"graph\"][\"edges_total\"]}')" 2>/dev/null || echo "Backend: Not running"
	@curl -s http://localhost:5174/ -o /dev/null -w "Frontend: %{http_code}\n" 2>/dev/null || echo "Frontend: Not running"
