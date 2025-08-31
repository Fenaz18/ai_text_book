from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
import os

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding service
        Using all-MiniLM-L6-v2: fast, good quality, only 80MB
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the sentence transformer model"""
        try:
            print(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print("Embedding model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        Returns: List of floats (embedding vector)
        """
        if not self.model:
            raise Exception("Model not loaded")
        
        # Clean text for better embeddings
        cleaned_text = self._clean_text_for_embedding(text)
        
        # Generate embedding
        embedding = self.model.encode(cleaned_text, convert_to_tensor=False)
        
        # Convert to list for MongoDB storage
        return embedding.tolist()
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts at once (more efficient)
        Returns: List of embedding vectors
        """
        if not self.model:
            raise Exception("Model not loaded")
        
        # Clean texts
        cleaned_texts = [self._clean_text_for_embedding(text) for text in texts]
        
        # Generate embeddings in batch
        embeddings = self.model.encode(cleaned_texts, convert_to_tensor=False, show_progress_bar=True)
        
        # Convert to list of lists
        return [embedding.tolist() for embedding in embeddings]
    
    def find_similar_chunks(self, query_embedding: List[float], chunk_embeddings: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find most similar chunks to query
        Args:
            query_embedding: Query embedding vector
            chunk_embeddings: List of dicts with 'embedding' and other chunk data
            top_k: Number of top results to return
        Returns: Ranked list of chunks with similarity scores
        """
        if not chunk_embeddings:
            return []
        
        # Extract embeddings and prepare data
        embeddings_matrix = np.array([chunk['embedding'] for chunk in chunk_embeddings])
        query_vector = np.array([query_embedding])
        
        # Calculate cosine similarities
        similarities = cosine_similarity(query_vector, embeddings_matrix)[0]
        
        # Add similarity scores to chunks
        for i, chunk in enumerate(chunk_embeddings):
            chunk['similarity_score'] = float(similarities[i])
        
        # Sort by similarity score (descending) and return top_k
        sorted_chunks = sorted(chunk_embeddings, key=lambda x: x['similarity_score'], reverse=True)
        
        return sorted_chunks[:top_k]
    
    def _clean_text_for_embedding(self, text: str) -> str:
        """Clean text to improve embedding quality"""
        import re
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove page markers if present
        text = re.sub(r'--- Page \d+ ---', '', text)
        
        # Truncate very long texts (model has token limits)
        if len(text) > 5000:  # Roughly 1000 tokens
            text = text[:5000] + "..."
        
        return text.strip()

# Global embedding service instance
embedding_service = EmbeddingService()