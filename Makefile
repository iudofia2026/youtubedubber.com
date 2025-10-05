.PHONY: install dev test format lint clean

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd web && npm install
	@echo "Installing pre-commit hooks..."
	pre-commit install

# Development mode
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Press Ctrl+C to stop all servers"
	@trap 'kill %1; kill %2' INT; \
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 & \
	cd web && npm run dev & \
	wait

# Backend only
dev-backend:
	@echo "Starting backend server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
dev-frontend:
	@echo "Starting frontend server..."
	cd web && npm run dev

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v
	@echo "Running frontend tests..."
	cd web && npm test

# Format code
format:
	@echo "Formatting Python code..."
	cd backend && black . && isort .
	@echo "Formatting TypeScript/JavaScript code..."
	cd web && npm run format

# Lint code
lint:
	@echo "Linting Python code..."
	cd backend && ruff check . && ruff format --check .
	@echo "Linting TypeScript/JavaScript code..."
	cd web && npm run lint

# Clean up
clean:
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf backend/.pytest_cache/
	rm -rf web/.next/
	rm -rf web/out/
	rm -rf web/node_modules/.cache/

# Build for production
build:
	@echo "Building frontend..."
	cd web && npm run build
	@echo "Build complete!"

# Docker commands (for future use)
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down