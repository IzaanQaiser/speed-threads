#!/bin/bash

# SpeedThreads Development Setup Script
echo "🚀 Setting up SpeedThreads development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy .env.example to .env and add your API keys"
echo "2. Run 'npm run dev' to start the frontend"
echo "3. Run 'npm run start:backend' to start the backend"
echo "4. Load the Chrome extension from chrome-extension/ folder"
echo ""
echo "📚 For more details, see README.md"
