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

release:
	set -e
	python manage.py migrate --noinput
	python manage.py collectstatic --noinput

setup:
	if [ ! -d ".venv" ]; then
		echo "Creating virtual environment..."
		python -m venv .venv
	fi
	echo "Activating virtual environment..."
	source .venv/bin/activate
	echo "Installing requirements..."
	pip install -r requirements.txt
	echo "Running migrations..."
	$(MAKE) make_and_migrate
	echo "Setup complete! Run 'python bot.py' to start the bot."
	pre-commit install


