#!/usr/bin/env python3
"""
SpeedThreads Backend Startup Script
Run this to start the FastAPI server with proper configuration
"""

import os
import sys
import subprocess
from pathlib import Path

def check_env_file():
    """Check if .env file exists and has API key"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print("📝 Please create backend/.env and add your OpenAI API key:")
        print("   OPENAI_API_KEY=your_api_key_here")
        return False
    
    with open(env_path, 'r') as f:
        content = f.read()
        
    if "OPENAI_API_KEY=" not in content or "your_api_key_here" in content:
        print("❌ OpenAI API key not configured!")
        print("📝 Please edit backend/.env and add your actual API key:")
        print("   OPENAI_API_KEY=sk-...")
        return False
    
    print("✅ .env file configured")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, cwd=Path(__file__).parent)
        print("✅ Dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting SpeedThreads backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🔗 API docs at: http://localhost:8000/docs")
    print("💡 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "src.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

def main():
    print("🚀 SpeedThreads Backend Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("src/main.py").exists():
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Check environment
    if not check_env_file():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
