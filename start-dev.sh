#!/bin/bash

echo "🚀 Starting Crypto Portfolio Analyzer Development Environment"
echo ""

# Check if ports are available
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  Port 3001 is already in use. Stopping existing backend..."
    pkill -f "ts-node-dev"
fi

if lsof -i :4200 > /dev/null 2>&1; then
    echo "⚠️  Port 4200 is already in use. Stopping existing frontend..."
    pkill -f "ng serve"
fi

echo ""
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo ""
echo "🔧 Starting backend server (http://localhost:3001)..."
(cd backend && npm start) &
BACKEND_PID=$!

echo "🎨 Starting frontend server (http://localhost:4200)..."
# Disable Angular CLI prompts and analytics
export NG_CLI_ANALYTICS=false
export CI=true
(cd frontend && npm start) &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:4200"
echo "🔍 API Health: http://localhost:3001/api/v1/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    
    # Kill backend process
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "Backend server stopped"
    fi
    
    # Kill frontend process
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "Frontend server stopped"
    fi
    
    # Also kill any remaining processes by name
    pkill -f "ts-node-dev" 2>/dev/null || true
    pkill -f "ng serve" 2>/dev/null || true
    
    exit 0
}

# Set trap for cleanup
trap cleanup INT

# Wait for processes
wait