# Mirror Analysis UI Server

A React-based UI server for the Mirror Analysis application.

## Environment Configuration

The UI server can be configured using environment variables. Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

### Available Environment Variables

- `VITE_BACKEND_URL`: Backend API server URL (default: http://localhost:8000)
- `VITE_DEV_SERVER_PORT`: Development server port (default: 5173)
- `VITE_APP_TITLE`: Application title (default: Mirror Analysis UI)

### Example .env file

```bash
VITE_BACKEND_URL=http://localhost:8000
VITE_DEV_SERVER_PORT=5173
VITE_APP_TITLE=Mirror Analysis UI
```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Quick setup (interactive)
./setup-env.sh

# Or manually copy and edit
cp env.example .env
# Edit .env with your backend URL
```

### 3. Start Development Server

```bash
npm run dev
```

The UI server will start on `http://localhost:5173` and proxy API requests to your Django backend.

## CORS Configuration

This setup includes proper CORS configuration:

- **Development**: Uses Vite proxy to avoid CORS issues
- **Production**: Uses configurable backend URLs with proper CORS headers
- **Django Backend**: Includes `django-cors-headers` for cross-origin requests

## Build

```bash
npm run build
npm run preview
```

## Testing Configuration

Test your configuration with:

```bash
node test-config.js
```
