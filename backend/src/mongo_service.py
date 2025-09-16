import os
import logging
from datetime import datetime
from typing import Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from .models import UserDocument, ConversationDocument

# Set up logger for this module
logger = logging.getLogger(__name__)

class MongoService:
    def __init__(self):
        logger.info("🔧 Initializing MongoDB service...")
        
        # Get MongoDB URI from environment
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            logger.error("❌ MONGO_URI environment variable not found")
            raise ValueError("MONGO_URI environment variable is required")
        
        try:
            # Connect to MongoDB
            logger.info("🔗 Connecting to MongoDB...")
            self.client = MongoClient(mongo_uri)
            
            # Test the connection
            self.client.admin.command('ping')
            logger.info("✅ MongoDB connection successful")
            
            # Get database and collections
            self.db = self.client.speedthreads
            self.users_collection = self.db.users
            self.conversations_collection = self.db.conversations
            
            # Create indexes for better performance
            self._create_indexes()
            logger.info("✅ MongoDB service initialized successfully")
            
        except ConnectionFailure as e:
            logger.error(f"❌ MongoDB connection failed: {str(e)}")
            raise ValueError(f"Failed to connect to MongoDB: {str(e)}")
        except Exception as e:
            logger.error(f"❌ MongoDB initialization failed: {str(e)}")
            raise ValueError(f"MongoDB initialization failed: {str(e)}")
    
    def _create_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Create unique index on supabase_uid for users
            self.users_collection.create_index("supabase_uid", unique=True)
            
            # Create indexes for conversations
            self.conversations_collection.create_index("uid")
            self.conversations_collection.create_index("post_url")
            self.conversations_collection.create_index("created_at")
            
            logger.info("✅ MongoDB indexes created successfully")
        except Exception as e:
            logger.warning(f"⚠️ Failed to create indexes: {str(e)}")
    
    def save_user_to_mongo(self, uid: str, display_name: Optional[str] = None) -> bool:
        """
        Save or update user in MongoDB
        Args:
            uid: Supabase user ID
            display_name: User's display name from user_metadata
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"💾 Saving user to MongoDB - UID: {uid}, Display Name: {display_name}")
            
            now = datetime.utcnow()
            
            # Prepare user document
            user_doc = {
                "supabase_uid": uid,
                "display_name": display_name,
                "updated_at": now
            }
            
            # Use upsert to insert or update
            result = self.users_collection.update_one(
                {"supabase_uid": uid},
                {
                    "$set": user_doc,
                    "$setOnInsert": {"created_at": now}
                },
                upsert=True
            )
            
            if result.upserted_id or result.modified_count > 0:
                logger.info(f"✅ User saved successfully - UID: {uid}")
                return True
            else:
                logger.warning(f"⚠️ No changes made to user - UID: {uid}")
                return True  # Still considered successful if no changes needed
                
        except Exception as e:
            logger.error(f"❌ Failed to save user to MongoDB: {str(e)}")
            return False
    
    def get_user_by_uid(self, uid: str) -> Optional[dict]:
        """
        Get user by Supabase UID
        Args:
            uid: Supabase user ID
        Returns:
            dict: User document or None if not found
        """
        try:
            logger.info(f"🔍 Getting user from MongoDB - UID: {uid}")
            
            user = self.users_collection.find_one({"supabase_uid": uid})
            
            if user:
                # Convert ObjectId to string for JSON serialization
                user["_id"] = str(user["_id"])
                logger.info(f"✅ User found - UID: {uid}")
                return user
            else:
                logger.info(f"ℹ️ User not found - UID: {uid}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to get user from MongoDB: {str(e)}")
            return None
    
    def save_conversation(self, uid: str, post_url: str, ai_messages: list, user_messages: list) -> Optional[str]:
        """
        Save conversation to MongoDB
        Args:
            uid: Supabase user ID
            post_url: URL of the post being discussed
            ai_messages: List of AI messages
            user_messages: List of user messages
        Returns:
            str: Conversation ID if successful, None otherwise
        """
        try:
            logger.info(f"💾 Saving conversation to MongoDB - UID: {uid}, Post URL: {post_url}")
            logger.info(f"📊 Messages - AI: {len(ai_messages)}, User: {len(user_messages)}")
            
            now = datetime.utcnow()
            
            # Prepare conversation document
            conversation_doc = {
                "uid": uid,
                "post_url": post_url,
                "ai_messages": ai_messages,
                "user_messages": user_messages,
                "created_at": now,
                "updated_at": now
            }
            
            # Insert conversation
            result = self.conversations_collection.insert_one(conversation_doc)
            
            if result.inserted_id:
                conversation_id = str(result.inserted_id)
                logger.info(f"✅ Conversation saved successfully - ID: {conversation_id}")
                return conversation_id
            else:
                logger.error("❌ Failed to insert conversation")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to save conversation to MongoDB: {str(e)}")
            return None
    
    def get_user_conversations(self, uid: str, limit: int = 10) -> list:
        """
        Get user's conversations
        Args:
            uid: Supabase user ID
            limit: Maximum number of conversations to return
        Returns:
            list: List of conversation documents
        """
        try:
            logger.info(f"🔍 Getting conversations for user - UID: {uid}, Limit: {limit}")
            
            conversations = list(
                self.conversations_collection
                .find({"uid": uid})
                .sort("created_at", -1)
                .limit(limit)
            )
            
            # Convert ObjectIds to strings
            for conv in conversations:
                conv["_id"] = str(conv["_id"])
            
            logger.info(f"✅ Found {len(conversations)} conversations for user - UID: {uid}")
            return conversations
            
        except Exception as e:
            logger.error(f"❌ Failed to get user conversations: {str(e)}")
            return []
    
    def close_connection(self):
        """Close MongoDB connection"""
        try:
            self.client.close()
            logger.info("✅ MongoDB connection closed")
        except Exception as e:
            logger.error(f"❌ Error closing MongoDB connection: {str(e)}")
