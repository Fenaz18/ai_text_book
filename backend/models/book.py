from datetime import datetime
from typing import Optional
from bson import ObjectId

class Book:
    def __init__(self, filename: str, total_pages: int, raw_text: str):
        self.filename = filename
        self.upload_date = datetime.now()
        self.total_pages = total_pages
        self.raw_text = raw_text
        self.text_length = len(raw_text)
    
    def to_dict(self):
        return {
            "filename": self.filename,
            "upload_date": self.upload_date,
            "total_pages": self.total_pages,
            "raw_text": self.raw_text,
            "text_length": self.text_length
        }