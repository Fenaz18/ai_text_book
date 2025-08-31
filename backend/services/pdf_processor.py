import PyPDF2
import io
import re
from fastapi import HTTPException
from typing import List, Tuple
from models.chunk import Chunk

class PDFProcessor:
    @staticmethod
    def extract_text_from_pdf(pdf_content: bytes) -> tuple[str, int]:
        """
        Extract text from PDF content
        Returns: (extracted_text, total_pages)
        """
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            total_pages = len(pdf_reader.pages)
            
            # Extract text from all pages
            raw_text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    raw_text += f"\n--- Page {page_num + 1} ---\n" + page_text + "\n"
            
            # Basic validation
            if len(raw_text.strip()) < 100:
                raise HTTPException(status_code=400, detail="PDF appears to be empty or unreadable")
            
            print(f"DEBUG: Extracted {len(raw_text)} characters from {total_pages} pages")
            return raw_text, total_pages
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    @staticmethod
    def chunk_text(text: str, book_id: str, chunk_size: int = 800, overlap: int = 100) -> List[Chunk]:
        """
        Break text into meaningful chunks with better algorithm
        Args:
            text: Full text content
            book_id: Reference to parent book
            chunk_size: Target size for each chunk (characters)
            overlap: Overlap between chunks
        Returns: List of Chunk objects
        """
        print(f"DEBUG: Starting to chunk {len(text)} characters")
        
        # Clean text but preserve structure
        text = PDFProcessor._clean_text(text)
        print(f"DEBUG: After cleaning: {len(text)} characters")
        
        # Use sliding window approach for reliable chunking
        chunks = PDFProcessor._sliding_window_chunk(text, book_id, chunk_size, overlap)
        
        print(f"DEBUG: Created {len(chunks)} chunks")
        return chunks
    
    @staticmethod
    def _sliding_window_chunk(text: str, book_id: str, chunk_size: int, overlap: int) -> List[Chunk]:
        """
        Create chunks using sliding window approach - guaranteed to capture all text
        """
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            # Calculate end position
            end = min(start + chunk_size, len(text))
            
            # Extract chunk content
            chunk_content = text[start:end]
            
            # Try to break at sentence boundary if we're not at the end
            if end < len(text):
                # Look for sentence endings in the last 200 characters
                search_start = max(0, len(chunk_content) - 200)
                last_sentence_end = max(
                    chunk_content.rfind('.', search_start),
                    chunk_content.rfind('!', search_start),
                    chunk_content.rfind('?', search_start),
                    chunk_content.rfind('\n\n', search_start)  # Paragraph break
                )
                
                if last_sentence_end > search_start:
                    chunk_content = chunk_content[:last_sentence_end + 1]
                    end = start + len(chunk_content)
            
            # Skip if chunk is too small (unless it's the last chunk)
            if len(chunk_content.strip()) < 50 and end < len(text):
                start += 100  # Skip forward a bit
                continue
            
            # Create chunk object
            chunk = Chunk(
                book_id=book_id,
                content=chunk_content.strip(),
                chunk_index=chunk_index,
                chapter=PDFProcessor._detect_chapter(chunk_content),
                section=PDFProcessor._detect_section(chunk_content)
            )
            chunks.append(chunk)
            
            # Move start position (with overlap)
            if end >= len(text):
                break  # We've reached the end
            
            start = max(start + chunk_size - overlap, start + 1)  # Ensure progress
            chunk_index += 1
        
        return chunks
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """Clean extracted text but preserve structure"""
        # Remove excessive whitespace but keep paragraph breaks
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Max 2 consecutive newlines
        text = re.sub(r' {3,}', ' ', text)  # Reduce multiple spaces
        text = re.sub(r'\t+', ' ', text)  # Replace tabs with single space
        
        # Remove common PDF artifacts but be conservative
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)  # Standalone page numbers
        
        return text.strip()
    
    @staticmethod
    def _detect_chapter(text: str) -> str:
        """Try to detect chapter from text content"""
        lines = text.split('\n')[:10]  # Check first 10 lines
        
        for line in lines:
            line = line.strip()
            if len(line) < 100:  # Only check shorter lines (likely headers)
                # Look for chapter patterns
                chapter_patterns = [
                    r'chapter\s+(\d+|[ivxlcdm]+)',
                    r'unit\s+(\d+)',
                    r'part\s+(\d+|[ivxlcdm]+)',
                    r'section\s+(\d+)',
                    r'^\d+\.\s+[A-Z][a-z]'
                ]
                
                for pattern in chapter_patterns:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        return line[:50]  # Return first 50 chars of the line
        
        return None
    
    @staticmethod
    def _detect_section(text: str) -> str:
        """Try to detect section from text content"""
        lines = text.split('\n')[:5]
        
        for line in lines:
            line = line.strip()
            if len(line) < 80:
                # Look for subsection patterns
                patterns = [
                    r'^\d+\.\d+',
                    r'^\d+\.\d+\.\d+',
                    r'^[A-Z][a-z]+:',
                    r'^\([a-z]\)',
                    r'^\d+\)'
                ]
                
                for pattern in patterns:
                    if re.match(pattern, line):
                        return line[:50]
        
        return None