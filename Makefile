make_and_migrate:
	.venv/bin/python3 manage.py makemigrations
	.venv/bin/python3 manage.py migrate
	echo "Migrations completed"

runserver:
	@echo "Starting Django server..."
	@echo "If you get 'port already in use' error, run: make stop"
	.venv/bin/python3 manage.py runserver

runserver_wm:
	watchmedo auto-restart --patterns="*.py" --recursive -- python3 manage.py runserver

build_frontend:
	npm ci
	cd frontend && npm ci && npm run build:heroku
	@echo "Frontend build complete!"

frontend_dev:
	@echo "Starting Vite development server..."
	@echo "If you get 'port already in use' error, run: make stop"
	cd frontend && npm run dev

frontend_install:
	cd frontend && npm install

frontend_clean:
	rm -rf frontend/node_modules
	rm -rf static/frontend

release:
	set -e
	python3 manage.py migrate --noinput
	python3 manage.py collectstatic --noinput

release_with_frontend:
	set -e
	$(MAKE) build_frontend
	python3 manage.py migrate --noinput
	python3 manage.py collectstatic --noinput

setup:
	python3 -m venv .venv
	.venv/bin/pip install -r requirements.txt
	.venv/bin/python3 -m pip install pre-commit
	.venv/bin/pre-commit install
	@if [ ! -f .env ]; then \
		echo "OPENAI_API_KEY=your-openai-api-key" > .env; \
		echo "Created .env file - please update with your actual OpenAI API key"; \
	fi
	mkdir -p staticfiles
	$(MAKE) frontend_install
	$(MAKE) make_and_migrate

stop:
	@echo "Stopping development servers..."
	@pkill -f "manage.py runserver" || true
	@pkill -f "vite" || true
	@echo "Servers stopped."


