#!/bin/bash

# SpeedThreads Development Setup Script

echo "🚀 Setting up SpeedThreads development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📁 Project structure looks good!"

# Check if Chrome is available
if command -v google-chrome &> /dev/null || command -v chrome &> /dev/null; then
    echo "✅ Chrome browser detected"
else
    echo "⚠️  Chrome browser not found - you'll need it to test the extension"
fi

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 detected"
    
    # Setup backend virtual environment
    echo "🐍 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
    cd ..
else
    echo "⚠️  Python 3 not found - backend setup skipped"
fi

# Check if Ollama is available
if command -v ollama &> /dev/null; then
    echo "✅ Ollama detected"
    echo "💡 To download a model, run: ollama pull llama2:7b"
else
    echo "⚠️  Ollama not found - install it for AI processing:"
    echo "   curl -fsSL https://ollama.ai/install.sh | sh"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Load the Chrome extension from chrome-extension/ folder"
echo "2. Visit a Reddit or X thread to test"
echo "3. Run 'cd backend && uvicorn src.main:app --reload' to start the backend"
echo ""
echo "Happy coding! 🚀"
