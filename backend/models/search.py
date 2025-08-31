from typing import List, Optional
from pydantic import BaseModel

class SearchQuery(BaseModel):
    query: str
    book_ids: Optional[List[str]] = None  # If None, search all books
    top_k: int = 5  # Number of results to return
    min_similarity: float = 0.1  # Minimum similarity threshold

class SearchResult(BaseModel):
    chunk_id: str
    book_id: str
    content: str
    similarity_score: float
    chunk_index: int
    chapter: Optional[str] = None
    section: Optional[str] = None
    book_filename: str