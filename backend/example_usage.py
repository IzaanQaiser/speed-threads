#!/usr/bin/env python3
"""
Example usage of MongoDB integration with Supabase authentication
This shows how to use the new functionality in your application
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Example 1: Direct MongoDB usage (for backend services)
def example_direct_mongo_usage():
    """Example of using MongoDB service directly"""
    print("📝 Example 1: Direct MongoDB Usage")
    print("-" * 40)
    
    # Import the MongoDB service
    sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
    from mongo_service import MongoService
    
    try:
        # Initialize MongoDB service
        mongo_service = MongoService()
        
        # Example: Save a user when they sign up
        uid = "user-12345"
        display_name = "John Doe"
        
        print(f"Saving user: {uid} ({display_name})")
        success = mongo_service.save_user_to_mongo(uid, display_name)
        
        if success:
            print("✅ User saved successfully")
            
            # Example: Save a conversation
            conversation_id = mongo_service.save_conversation(
                uid=uid,
                post_url="https://reddit.com/r/programming/comments/example",
                ai_messages=[
                    "This post discusses Python vs JavaScript for beginners.",
                    "Based on the comments, Python seems more beginner-friendly."
                ],
                user_messages=[
                    "What do you think about this programming language debate?",
                    "Which one would you recommend for a complete beginner?"
                ]
            )
            
            if conversation_id:
                print(f"✅ Conversation saved with ID: {conversation_id}")
                
                # Example: Retrieve user's conversations
                conversations = mongo_service.get_user_conversations(uid, limit=5)
                print(f"📚 Found {len(conversations)} conversations for user")
                
                for i, conv in enumerate(conversations):
                    print(f"  {i+1}. {conv['post_url']}")
                    print(f"     AI messages: {len(conv['ai_messages'])}")
                    print(f"     User messages: {len(conv['user_messages'])}")
        
        # Close connection
        mongo_service.close_connection()
        
    except Exception as e:
        print(f"❌ Error: {e}")

# Example 2: API usage (for frontend applications)
def example_api_usage():
    """Example of using the API endpoints"""
    print("\n📝 Example 2: API Usage")
    print("-" * 40)
    
    base_url = "http://localhost:8000"
    
    # Example: Save a user via API
    user_data = {
        "uid": "api-user-67890",
        "display_name": "API User"
    }
    
    try:
        response = requests.post(f"{base_url}/user/save", json=user_data)
        if response.status_code == 200:
            print("✅ User saved via API")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ User save failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ API error: {e}")
    
    # Example: Save a conversation via API (requires authentication)
    conversation_data = {
        "post_url": "https://reddit.com/r/technology/comments/example",
        "ai_messages": [
            "This is an interesting technology discussion.",
            "The community seems divided on this topic."
        ],
        "user_messages": [
            "What's your take on this technology trend?",
            "Do you think this will become mainstream?"
        ]
    }
    
    # Note: In a real application, you would get the token from Supabase auth
    # For this example, we'll just show the structure
    headers = {
        "Authorization": "Bearer YOUR_SUPABASE_JWT_TOKEN_HERE",
        "Content-Type": "application/json"
    }
    
    print("\nTo save a conversation, you would make a POST request like this:")
    print(f"POST {base_url}/conversations/save")
    print(f"Headers: {headers}")
    print(f"Body: {json.dumps(conversation_data, indent=2)}")
    
    # Example: Get conversations via API
    print("\nTo get conversations, you would make a GET request like this:")
    print(f"GET {base_url}/conversations?limit=10")
    print(f"Headers: {headers}")

# Example 3: Integration with Supabase authentication
def example_supabase_integration():
    """Example of integrating with Supabase authentication"""
    print("\n📝 Example 3: Supabase Integration")
    print("-" * 40)
    
    try:
        from supabase import create_client, Client
        
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found")
            return
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Example: When a user signs up or logs in
        def handle_user_auth(token):
            """Handle user authentication and save to MongoDB"""
            try:
                # Validate token with Supabase
                response = supabase.auth.get_user(token)
                
                if response.user:
                    uid = response.user.id
                    display_name = response.user.user_metadata.get("name") if response.user.user_metadata else None
                    
                    print(f"✅ User authenticated: {uid} ({display_name})")
                    
                    # Save to MongoDB
                    sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
                    from mongo_service import MongoService
                    
                    mongo_service = MongoService()
                    success = mongo_service.save_user_to_mongo(uid, display_name)
                    
                    if success:
                        print("✅ User saved to MongoDB")
                    else:
                        print("❌ Failed to save user to MongoDB")
                    
                    mongo_service.close_connection()
                    return True
                else:
                    print("❌ Invalid token")
                    return False
                    
            except Exception as e:
                print(f"❌ Authentication error: {e}")
                return False
        
        print("Example authentication handler created")
        print("In your app, call handle_user_auth(token) when user signs up/logs in")
        
    except Exception as e:
        print(f"❌ Supabase integration error: {e}")

def main():
    """Run all examples"""
    print("🚀 MongoDB Integration Examples")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("src/mongo_service.py"):
        print("❌ Please run this script from the backend directory")
        return
    
    # Run examples
    example_direct_mongo_usage()
    example_api_usage()
    example_supabase_integration()
    
    print("\n" + "=" * 50)
    print("✅ Examples completed!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Set up your .env file with MongoDB URI")
    print("3. Run the backend: python -m src.main")
    print("4. Test the integration: python test_mongo_integration.py")

if __name__ == "__main__":
    main()
