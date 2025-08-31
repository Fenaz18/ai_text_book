from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/"))
        self.db = self.client.textbook_ai
        
    def get_books_collection(self):
        return self.db.books
    
    def get_chunks_collection(self):
        return self.db.chunks
    
    def create_indexes(self):
        """Create database indexes for better performance"""
        # Index for chunks by book_id
        self.db.chunks.create_index("book_id")
        # Index for text search (optional)
        self.db.chunks.create_index([("content", "text")])

# Global database instance
database = Database()

# Create indexes on startup
try:
    database.create_indexes()
except Exception as e:
    print(f"Warning: Could not create indexes: {e}")