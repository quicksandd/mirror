make_and_migrate:
	python manage.py makemigrations
	python manage.py migrate
	echo "Migrations completed"

runbot:
	watchmedo auto-restart --patterns="*.py" --recursive -- python bot.py

runserver:
	python manage.py runserver

runserver_wm:
	watchmedo auto-restart --patterns="*.py" --recursive -- python manage.py runserver

build_frontend:
	cd front && npm ci && npm run build:heroku
	@echo "Frontend build complete!"

frontend_dev:
	cd front && npm run dev

frontend_install:
	cd front && npm install

frontend_clean:
	rm -rf front/node_modules
	rm -rf static/frontend

release:
	set -e
	$(MAKE) build_frontend
	python manage.py migrate --noinput
	python manage.py collectstatic --noinput

setup:
	python -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	$(MAKE) make_and_migrate
	pre-commit install


