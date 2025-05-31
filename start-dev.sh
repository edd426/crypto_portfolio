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
cd backend && npm start &
BACKEND_PID=$!

echo "🎨 Starting frontend server (http://localhost:4200)..."
cd frontend && npx ng serve &
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

# Wait for Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait