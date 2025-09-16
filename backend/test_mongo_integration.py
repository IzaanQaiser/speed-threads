#!/usr/bin/env python3
"""
Test script for MongoDB integration with Supabase authentication
This demonstrates the complete flow of user authentication and conversation storage
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from mongo_service import MongoService
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_mongo_connection():
    """Test MongoDB connection"""
    print("🔧 Testing MongoDB connection...")
    try:
        mongo_service = MongoService()
        print("✅ MongoDB connection successful")
        return mongo_service
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None

def test_supabase_connection():
    """Test Supabase connection"""
    print("🔧 Testing Supabase connection...")
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found in environment")
            return None
        
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Supabase connection successful")
        return supabase
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return None

def test_user_save(mongo_service, uid="test-user-123", display_name="Test User"):
    """Test saving a user to MongoDB"""
    print(f"💾 Testing user save - UID: {uid}, Display Name: {display_name}")
    try:
        success = mongo_service.save_user_to_mongo(uid, display_name)
        if success:
            print("✅ User saved successfully")
        else:
            print("❌ User save failed")
        return success
    except Exception as e:
        print(f"❌ User save error: {e}")
        return False

def test_user_retrieval(mongo_service, uid="test-user-123"):
    """Test retrieving a user from MongoDB"""
    print(f"🔍 Testing user retrieval - UID: {uid}")
    try:
        user = mongo_service.get_user_by_uid(uid)
        if user:
            print(f"✅ User found: {user}")
        else:
            print("ℹ️ User not found")
        return user
    except Exception as e:
        print(f"❌ User retrieval error: {e}")
        return None

def test_conversation_save(mongo_service, uid="test-user-123"):
    """Test saving a conversation to MongoDB"""
    print(f"💾 Testing conversation save - UID: {uid}")
    try:
        conversation_id = mongo_service.save_conversation(
            uid=uid,
            post_url="https://reddit.com/r/test/comments/example",
            ai_messages=[
                "This is a test AI message",
                "Here's another AI response"
            ],
            user_messages=[
                "What do you think about this post?",
                "Can you explain more about that?"
            ]
        )
        
        if conversation_id:
            print(f"✅ Conversation saved successfully - ID: {conversation_id}")
            return conversation_id
        else:
            print("❌ Conversation save failed")
            return None
    except Exception as e:
        print(f"❌ Conversation save error: {e}")
        return None

def test_conversation_retrieval(mongo_service, uid="test-user-123"):
    """Test retrieving conversations from MongoDB"""
    print(f"🔍 Testing conversation retrieval - UID: {uid}")
    try:
        conversations = mongo_service.get_user_conversations(uid, limit=5)
        print(f"✅ Found {len(conversations)} conversations")
        for i, conv in enumerate(conversations):
            print(f"  Conversation {i+1}: {conv['post_url']} ({len(conv['ai_messages'])} AI, {len(conv['user_messages'])} User)")
        return conversations
    except Exception as e:
        print(f"❌ Conversation retrieval error: {e}")
        return []

def test_api_endpoints():
    """Test the API endpoints"""
    print("🌐 Testing API endpoints...")
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test user save endpoint
    try:
        user_data = {
            "uid": "api-test-user-456",
            "display_name": "API Test User"
        }
        response = requests.post(f"{base_url}/user/save", json=user_data)
        if response.status_code == 200:
            print("✅ User save API endpoint working")
        else:
            print(f"❌ User save API failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ User save API error: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting MongoDB integration tests...")
    print("=" * 50)
    
    # Test MongoDB connection
    mongo_service = test_mongo_connection()
    if not mongo_service:
        print("❌ Cannot proceed without MongoDB connection")
        return
    
    print("\n" + "=" * 50)
    
    # Test Supabase connection
    supabase = test_supabase_connection()
    if not supabase:
        print("⚠️ Supabase not available, but MongoDB tests can continue")
    
    print("\n" + "=" * 50)
    
    # Test user operations
    test_uid = "integration-test-user-789"
    test_display_name = "Integration Test User"
    
    print("👤 Testing user operations...")
    test_user_save(mongo_service, test_uid, test_display_name)
    test_user_retrieval(mongo_service, test_uid)
    
    print("\n" + "=" * 50)
    
    # Test conversation operations
    print("💬 Testing conversation operations...")
    conversation_id = test_conversation_save(mongo_service, test_uid)
    if conversation_id:
        test_conversation_retrieval(mongo_service, test_uid)
    
    print("\n" + "=" * 50)
    
    # Test API endpoints (if server is running)
    print("🌐 Testing API endpoints...")
    test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    
    # Cleanup
    try:
        mongo_service.close_connection()
        print("🔌 MongoDB connection closed")
    except:
        pass

if __name__ == "__main__":
    main()
