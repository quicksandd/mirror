#!/bin/bash

# Setup environment variables for Mirror Analysis UI Server

echo "Setting up environment variables for Mirror Analysis UI Server..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Get backend URL from user
echo "Enter the backend server URL (e.g., http://localhost:8000):"
read -p "Backend URL [http://localhost:8000]: " backend_url
backend_url=${backend_url:-"http://localhost:8000"}

# Get dev server port from user
echo "Enter the development server port:"
read -p "Dev Server Port [5173]: " dev_port
dev_port=${dev_port:-"5173"}

# Get app title from user
echo "Enter the application title:"
read -p "App Title [Mirror Analysis UI]: " app_title
app_title=${app_title:-"Mirror Analysis UI"}

# Create .env file
cat > .env << EOF
# Backend API configuration
VITE_BACKEND_URL=${backend_url}

# Development server configuration
VITE_DEV_SERVER_PORT=${dev_port}

# Build configuration
VITE_APP_TITLE=${app_title}
EOF

echo ""
echo "✅ Environment file created successfully!"
echo "📁 .env file created with the following values:"
echo "   VITE_BACKEND_URL=${backend_url}"
echo "   VITE_DEV_SERVER_PORT=${dev_port}"
echo "   VITE_APP_TITLE=${app_title}"
echo ""
echo "You can now run: npm run dev"
