# Heroku Deployment Guide

This guide explains how to deploy the Mirror app with both Django backend and React frontend to Heroku.

## Setup

### 1. Prerequisites
- Heroku CLI installed
- Git repository with the code
- Heroku app created

### 2. Buildpack Configuration
The app uses multiple buildpacks:
- Node.js buildpack (for frontend build)
- Python buildpack (for Django backend)

The `.buildpacks` file specifies the order:
```
https://github.com/heroku/heroku-buildpack-nodejs
https://github.com/heroku/heroku-buildpack-python
```

### 3. Environment Variables
Set the following environment variables in Heroku:
```bash
heroku config:set DJANGO_SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set MIRROR_ENABLED=True
heroku config:set VITE_BACKEND_URL=
```

## Deployment Process

### Automatic Deployment
When you push to Heroku, the following happens automatically:

1. **Node.js Buildpack** runs:
   - Installs Node.js dependencies (`npm ci`)
   - Builds the React frontend (`npm run build:heroku`)
   - Outputs to `../static/frontend/`

2. **Python Buildpack** runs:
   - Installs Python dependencies
   - Runs Django migrations
   - Collects static files (including the built frontend)

### Manual Deployment
```bash
# Build frontend locally (optional)
./build_frontend.sh

# Deploy to Heroku
git add .
git commit -m "Deploy with frontend build"
git push heroku main
```

## File Structure After Build

```
static/
├── frontend/           # Built React app
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
└── ...                 # Other Django static files
```

## URL Routing

- `/` - Serves the React frontend (main app)
- `/mirror/insights/<uuid>` - Serves the React frontend (insights page)
- `/mirror/api/*` - Django API endpoints
- `/admin/` - Django admin
- `/static/*` - Static files (CSS, JS, images)

### URL Flow:
1. User visits `/mirror/insights/5d1a5f00-3577-454f-981e-9bd6d7978ed6/`
2. Django serves the React app (not the API)
3. React router handles the route and shows `Insight.jsx` component
4. React component makes API call to `/mirror/api/insights/5d1a5f00-3577-454f-981e-9bd6d7978ed6/`
5. Django API returns the data
6. React component displays the insights

## Troubleshooting

### Frontend Not Loading
1. Check if `static/frontend/index.html` exists
2. Verify build process completed successfully
3. Check Heroku logs: `heroku logs --tail`

### Static Files Issues
1. Ensure `collectstatic` ran successfully
2. Check `STATIC_ROOT` and `STATICFILES_DIRS` settings
3. Verify WhiteNoise configuration

### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies are in `package.json`
3. Check for any build errors in logs

## Development

### Available Makefile Commands
```bash
make build_frontend    # Build frontend for production
make frontend_dev      # Start frontend development server
make frontend_install  # Install frontend dependencies
make frontend_clean    # Clean frontend build and node_modules
make release          # Full release process (build + migrate + collectstatic)
```

### Local Development
```bash
# Backend
python manage.py runserver

# Frontend (separate terminal)
make frontend_dev
```

**Note**: Frontend files are now in the `frontend/` directory (moved from `front/`).

### Local Production Build Test
```bash
# Build frontend
make build_frontend

# Collect static files
python manage.py collectstatic

# Run server
python manage.py runserver
```

## Notes

- The React app is built with Vite and configured for production
- Static files are served by WhiteNoise in production
- The frontend makes API calls to `/mirror/api/*` endpoints
- CORS is configured to allow frontend-backend communication
