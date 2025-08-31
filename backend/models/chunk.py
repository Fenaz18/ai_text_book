from datetime import datetime
from typing import Optional
from bson import ObjectId

class Chunk:
    def __init__(self, book_id: str, content: str, chunk_index: int, chapter: str = None, section: str = None):
        self.book_id = book_id
        self.content = content
        self.chunk_index = chunk_index
        self.chapter = chapter
        self.section = section
        self.word_count = len(content.split())
        self.char_count = len(content)
        self.created_at = datetime.now()
    
    def to_dict(self):
        return {
            "book_id": self.book_id,
            "content": self.content,
            "chunk_index": self.chunk_index,
            "chapter": self.chapter,
            "section": self.section,
            "word_count": self.word_count,
            "char_count": self.char_count,
            "created_at": self.created_at
        }