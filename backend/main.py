from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import database
from models.book import Book
from models.search import SearchQuery, SearchResult
from services.pdf_processor import PDFProcessor
from services.embeddings import embedding_service
# Also add ObjectId import at the top
from bson import ObjectId
from typing import List, Optional
from services.gemini_client import gemini_client
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from services.murf_client import murf_client
# import aiofiles
import os


app = FastAPI()

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio
app.mount("/audio", StaticFiles(directory="audio_files"), name="audio")
def generate_embeddings_background(book_id: str):
    """Background task to generate embeddings for chunks"""
    try:
        chunks_collection = database.get_chunks_collection()
        
        # Get all chunks for this book that don't have embeddings
        chunks = list(chunks_collection.find({
            "book_id": book_id,
            "embedding": {"$exists": False}
        }))
        
        if not chunks:
            print(f"No chunks need embeddings for book {book_id}")
            return
        
        print(f"Generating embeddings for {len(chunks)} chunks...")
        
        # Extract texts
        texts = [chunk['content'] for chunk in chunks]
        
        # Generate embeddings in batch
        embeddings = embedding_service.generate_embeddings_batch(texts)
        
        # Update chunks with embeddings
        for i, chunk in enumerate(chunks):
            chunks_collection.update_one(
                {"_id": chunk["_id"]},
                {"$set": {"embedding": embeddings[i]}}
            )
        
        print(f"Successfully generated embeddings for {len(chunks)} chunks")
        
    except Exception as e:
        print(f"Error generating embeddings: {e}")




@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...),background_tasks: BackgroundTasks = BackgroundTasks()):
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read PDF content
    pdf_content = await file.read()
    
    # Extract text using PDF processor
    raw_text, total_pages = PDFProcessor.extract_text_from_pdf(pdf_content)
    
    # Create book object and save to MongoDB
    book = Book(file.filename, total_pages, raw_text)
    books_collection = database.get_books_collection()
    result = books_collection.insert_one(book.to_dict())
    book_id = str(result.inserted_id)
    
    # Create chunks
    chunks = PDFProcessor.chunk_text(raw_text, book_id)
    
    # Save chunks to MongoDB
    if chunks:
        chunks_collection = database.get_chunks_collection()
        chunk_dicts = [chunk.to_dict() for chunk in chunks]
        chunks_collection.insert_many(chunk_dicts)

        # Generate embeddings in background
        background_tasks.add_task(generate_embeddings_background, book_id)

    
    # Calculate chunk statistics
    total_chunks = len(chunks)
    avg_chunk_size = sum(chunk.char_count for chunk in chunks) // total_chunks if total_chunks > 0 else 0
    
    # Return success with enhanced info
    return {
        "success": True,
        "book_id": book_id,
        "filename": file.filename,
        "total_pages": total_pages,
        "text_length": len(raw_text),
        "text_preview": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
        "chunks_created": total_chunks,
        "average_chunk_size": avg_chunk_size,
        "chunk_preview": chunks[0].content[:200] + "..." if chunks else "No chunks created",
        "embeddings_status": "generating_in_background"
    }

# Add this temporary endpoint to main.py for manual embedding generation
@app.post("/generate-all-embeddings")
async def generate_all_embeddings(background_tasks: BackgroundTasks):
    """Generate embeddings for all books that don't have them"""
    chunks_collection = database.get_chunks_collection()
    
    # Find all chunks without embeddings
    chunks_without_embeddings = list(chunks_collection.find({"embedding": {"$exists": False}}))
    
    if not chunks_without_embeddings:
        return {"message": "All chunks already have embeddings"}
    
    # Group by book_id
    book_ids = list(set(chunk['book_id'] for chunk in chunks_without_embeddings))
    
    # Generate embeddings for each book
    for book_id in book_ids:
        background_tasks.add_task(generate_embeddings_background, book_id)
    
    return {
        "message": f"Started embedding generation for {len(book_ids)} books",
        "chunks_to_process": len(chunks_without_embeddings),
        "book_ids": book_ids
    }


@app.post("/ask")
async def ask_question(search_query: SearchQuery):
    """Ask a question and get an AI-generated answer with sources"""
    print(f"=== ASK QUESTION CALLED ===")
    print(f"Query: {search_query.query}")
    
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini client not available")
    
    try:
        # First, search for relevant chunks
        query_embedding = embedding_service.generate_embedding(search_query.query)
        
        mongo_query = {"embedding": {"$exists": True}}
        if search_query.book_ids:
            mongo_query["book_id"] = {"$in": search_query.book_ids}
        
        chunks_collection = database.get_chunks_collection()
        chunks = list(chunks_collection.find(mongo_query))
        
        if not chunks:
            return {
                "success": False,
                "answer": "No textbook content available to answer this question. Please upload some textbooks first.",
                "query": search_query.query,
                "sources": [],
                "chunks_used": []
            }
        
        # Find similar chunks
        similar_chunks = embedding_service.find_similar_chunks(
            query_embedding, chunks, search_query.top_k
        )
        
        # Filter by similarity threshold
        filtered_chunks = [
            chunk for chunk in similar_chunks 
            if chunk['similarity_score'] >= search_query.min_similarity
        ]
        
        if not filtered_chunks:
            # Fallback: use simple Gemini response
            answer = gemini_client.generate_simple_response(search_query.query)
            return {
                "success": True,
                "answer": f"Based on general knowledge: {answer}",
                "query": search_query.query,
                "sources": [],
                "chunks_used": [],
                "note": "No highly relevant textbook content found. This is a general response."
            }
        
        # Get book filenames for context
        books_collection = database.get_books_collection()
        book_ids = list(set(chunk['book_id'] for chunk in filtered_chunks))
        books = {}
        
        if book_ids:
            books_cursor = books_collection.find(
                {"_id": {"$in": [ObjectId(bid) for bid in book_ids]}}
            )
            books = {str(book['_id']): book['filename'] for book in books_cursor}
        
        book_filenames = [books.get(chunk['book_id'], 'Unknown') for chunk in filtered_chunks]
        
        # Generate AI response using Gemini
        gemini_response = gemini_client.generate_educational_response(
            search_query.query, 
            filtered_chunks, 
            book_filenames
        )
        
        # Format source chunks for frontend
        source_chunks = []
        for chunk in filtered_chunks:
            source_chunks.append({
                "chunk_id": str(chunk['_id']),
                "content": chunk['content'][:300] + "..." if len(chunk['content']) > 300 else chunk['content'],
                "similarity_score": round(chunk['similarity_score'], 3),
                "book_filename": books.get(chunk['book_id'], 'Unknown'),
                "chapter": chunk.get('chapter'),
                "section": chunk.get('section')
            })
        
        return {
            "success": gemini_response["success"],
            "answer": gemini_response["answer"],
            "query": search_query.query,
            "sources": list(set(book_filenames)),
            "chunks_used": source_chunks,
            "total_chunks_found": len(filtered_chunks)
        }
        
    except Exception as e:
        print(f"Ask question error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")



@app.post("/search")
async def search_chunks(search_query: SearchQuery):
    """Search for relevant chunks using semantic similarity"""
    print(f"Search endpoint called with query: {search_query.query}")
    
    try:
        # Generate embedding for query
        query_embedding = embedding_service.generate_embedding(search_query.query)
        print(f"Generated query embedding of length: {len(query_embedding)}")
        
        # Build MongoDB query
        mongo_query = {"embedding": {"$exists": True}}
        if search_query.book_ids:
            mongo_query["book_id"] = {"$in": search_query.book_ids}
        
        # Get chunks with embeddings
        chunks_collection = database.get_chunks_collection()
        chunks = list(chunks_collection.find(mongo_query))
        print(f"Found {len(chunks)} chunks with embeddings")
        
        if not chunks:
            return {"results": [], "message": "No chunks with embeddings found", "query": search_query.query}
        
        # Find similar chunks
        similar_chunks = embedding_service.find_similar_chunks(
            query_embedding, chunks, search_query.top_k
        )
        print(f"Found {len(similar_chunks)} similar chunks")
        
        # Filter by minimum similarity
        filtered_chunks = [
            chunk for chunk in similar_chunks 
            if chunk['similarity_score'] >= search_query.min_similarity
        ]
        print(f"Filtered to {len(filtered_chunks)} chunks above threshold")
        
        # Get book filenames for results
        books_collection = database.get_books_collection()
        book_ids = list(set(chunk['book_id'] for chunk in filtered_chunks))
        books = {
            str(book['_id']): book['filename'] 
            for book in books_collection.find(
                {"_id": {"$in": [ObjectId(bid) for bid in book_ids]}}
            )
        }
        
        # Format results
        results = []
        for chunk in filtered_chunks:
            result = {
                "chunk_id": str(chunk['_id']),
                "book_id": chunk['book_id'],
                "content": chunk['content'][:1000],  # Limit content length
                "similarity_score": chunk['similarity_score'],
                "chunk_index": chunk['chunk_index'],
                "chapter": chunk.get('chapter'),
                "section": chunk.get('section'),
                "book_filename": books.get(chunk['book_id'], 'Unknown')
            }
            results.append(result)
        
        return {
            "query": search_query.query,
            "total_results": len(results),
            "results": results
        }
        
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.post("/books/{book_id}/generate-embeddings")
async def manually_generate_embeddings(book_id: str, background_tasks: BackgroundTasks):
    """Manually trigger embedding generation for a book"""
    background_tasks.add_task(generate_embeddings_background, book_id)
    return {"message": "Embedding generation started", "book_id": book_id}



@app.get("/books")
async def get_all_books():
    """Get list of all uploaded books"""
    books_collection = database.get_books_collection()
    chunks_collection = database.get_chunks_collection()
    
    books = list(books_collection.find({}, {
        "raw_text": 0  # Exclude raw_text for performance
    }))
    
    # Add chunk count and embedding status for each book
    for book in books:
        book["_id"] = str(book["_id"])
        book_id = book["_id"]
        
        total_chunks = chunks_collection.count_documents({"book_id": book_id})
        embedded_chunks = chunks_collection.count_documents({
            "book_id": book_id,
            "embedding": {"$exists": True}
        })
        
        book["chunk_count"] = total_chunks
        book["embedded_chunks"] = embedded_chunks
        book["embeddings_ready"] = embedded_chunks == total_chunks and  embedded_chunks > 0


          # Debug info
        print(f"Book {book['filename']}: {embedded_chunks}/{total_chunks} chunks embedded")
    
    print(f"Total books returned: {len(books)}")

    return {"books": books, "total": len(books)}


@app.get("/books/{book_id}/embedding-status")
async def get_embedding_status(book_id: str):
    """Check embedding generation status for a book"""
    chunks_collection = database.get_chunks_collection()
    
    total_chunks = chunks_collection.count_documents({"book_id": book_id})
    embedded_chunks = chunks_collection.count_documents({
        "book_id": book_id,
        "embedding": {"$exists": True}
    })
    
    return {
        "book_id": book_id,
        "total_chunks": total_chunks,
        "embedded_chunks": embedded_chunks,
        "progress_percentage": round((embedded_chunks / total_chunks) * 100, 2) if total_chunks > 0 else 0,
        "status": "completed" if embedded_chunks == total_chunks else "in_progress"
    }



@app.get("/books/{book_id}/chunks")
async def get_book_chunks(book_id: str):
    """Get all chunks for a specific book"""
    chunks_collection = database.get_chunks_collection()
    chunks = list(chunks_collection.find({"book_id": book_id}))
    
    # Convert ObjectId to string
    for chunk in chunks:
        chunk["_id"] = str(chunk["_id"])
    
    return {
        "book_id": book_id,
        "total_chunks": len(chunks),
        "chunks": chunks
    }

# Add this new endpoint after your existing ones

@app.get("/books/{book_id}/stats")
async def get_book_stats(book_id: str):
    """Get detailed statistics for debugging"""
    books_collection = database.get_books_collection()
    chunks_collection = database.get_chunks_collection()
    
    # Get book info
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get chunk stats
    chunks = list(chunks_collection.find({"book_id": book_id}))
    
    chunk_sizes = [chunk['char_count'] for chunk in chunks]
    total_chunk_chars = sum(chunk_sizes)
    
    return {
        "book_id": book_id,
        "filename": book["filename"],
        "original_text_length": book["text_length"],
        "total_chunks": len(chunks),
        "total_chunk_chars": total_chunk_chars,
        "coverage_percentage": round((total_chunk_chars / book["text_length"]) * 100, 2),
        "avg_chunk_size": sum(chunk_sizes) // len(chunk_sizes) if chunk_sizes else 0,
        "min_chunk_size": min(chunk_sizes) if chunk_sizes else 0,
        "max_chunk_size": max(chunk_sizes) if chunk_sizes else 0,
        "first_chunk_preview": chunks[0]["content"][:200] + "..." if chunks else None,
        "last_chunk_preview": chunks[-1]["content"][:200] + "..." if chunks else None
    }

@app.get("/debug/search-ready")
async def debug_search_ready():
    """Debug endpoint to check if search is ready"""
    chunks_collection = database.get_chunks_collection()
    
    # Count total chunks and embedded chunks
    total_chunks = chunks_collection.count_documents({})
    embedded_chunks = chunks_collection.count_documents({"embedding": {"$exists": True}})
    
    # Get sample embedded chunk
    sample_chunk = chunks_collection.find_one({"embedding": {"$exists": True}})
    
    return {
        "total_chunks": total_chunks,
        "embedded_chunks": embedded_chunks,
        "embedding_ready": embedded_chunks > 0,
        "sample_embedding_length": len(sample_chunk.get("embedding", [])) if sample_chunk else 0
    }

@app.post("/generate-audio")
async def generate_audio(request: dict):
    """Generate audio from text using Murf AI"""
    print(f"=== GENERATE AUDIO CALLED ===")
    
    if not murf_client:
        raise HTTPException(status_code=500, detail="Murf client not available")
    
    text = request.get("text", "")
    voice_id = request.get("voice_id", "en-US-ken")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    if len(text) > 3000:
        raise HTTPException(status_code=400, detail="Text too long (max 3000 characters)")
    
    try:
        result = murf_client.generate_audio(text, voice_id)
        return result
    except Exception as e:
        print(f"Audio generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")


@app.get("/voices")
async def get_available_voices():
    """Get available voices from Murf AI"""
    if not murf_client:
        return {"voices": []}
    
    try:
        # Return preset voices for now (Murf API voices endpoint might need different auth)
        preset_voices = murf_client.get_preset_voices()
        return {"voices": preset_voices}
    except Exception as e:
        print(f"Error getting voices: {e}")
        return {"voices": murf_client.get_preset_voices()}
    

@app.post("/ask-with-audio")
async def ask_question_with_audio(request: dict):
    """Ask a question and get both AI response and audio"""
    print(f"=== ASK WITH AUDIO CALLED ===")
    
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini client not available")
    
    query = request.get("query", "")
    book_ids = request.get("book_ids")
    voice_id = request.get("voice_id", "en-US-ken")
    generate_audio_flag = request.get("generate_audio", True)
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    try:

         # Detect target language from voice ID
        if murf_client:
            target_language = murf_client.get_language_from_voice(voice_id)["code"]
        else:
            target_language = "en-US"
        
        print(f"Target language detected: {target_language}")

        # First get AI response (reuse existing logic)
        search_query = SearchQuery(
            query=query,
            book_ids=book_ids,
            top_k=5,
            min_similarity=0.3
        )
        
        # Get AI response
        query_embedding = embedding_service.generate_embedding(query)
        
        mongo_query = {"embedding": {"$exists": True}}
        if book_ids:
            mongo_query["book_id"] = {"$in": book_ids}
        
        chunks_collection = database.get_chunks_collection()
        chunks = list(chunks_collection.find(mongo_query))
        
        if not chunks:
            ai_response = {
                "success": False,
                "answer": "No textbook content available to answer this question.",
                "query": query,
                "sources": [],
                "chunks_used": [],
                "language": target_language
            }
        else:
            similar_chunks = embedding_service.find_similar_chunks(
                query_embedding, chunks, 5
            )
            
            filtered_chunks = [
                chunk for chunk in similar_chunks 
                if chunk['similarity_score'] >= 0.3
            ]
            
            if not filtered_chunks:
                answer = gemini_client.generate_simple_response(query, target_language)
                ai_response = {
                    "success": True,
                    "answer": f"Based on general knowledge: {answer}",
                    "query": query,
                    "sources": [],
                    "chunks_used": [],
                    "note": "No highly relevant textbook content found.",
                    "language": target_language
                }
            else:
                books_collection = database.get_books_collection()
                book_ids_found = list(set(chunk['book_id'] for chunk in filtered_chunks))
                books = {}
                
                if book_ids_found:
                    books_cursor = books_collection.find(
                        {"_id": {"$in": [ObjectId(bid) for bid in book_ids_found]}}
                    )
                    books = {str(book['_id']): book['filename'] for book in books_cursor}
                
                book_filenames = [books.get(chunk['book_id'], 'Unknown') for chunk in filtered_chunks]
                
                gemini_response = gemini_client.generate_educational_response(
                    query, filtered_chunks, book_filenames, target_language
                )
                
                source_chunks = []
                for chunk in filtered_chunks:
                    source_chunks.append({
                        "chunk_id": str(chunk['_id']),
                        "content": chunk['content'][:300] + "..." if len(chunk['content']) > 300 else chunk['content'],
                        "similarity_score": round(chunk['similarity_score'], 3),
                        "book_filename": books.get(chunk['book_id'], 'Unknown'),
                        "chapter": chunk.get('chapter'),
                        "section": chunk.get('section')
                    })
                
                ai_response = {
                    "success": gemini_response["success"],
                    "answer": gemini_response["answer"],
                    "query": query,
                    "sources": list(set(book_filenames)),
                    "chunks_used": source_chunks,
                    "total_chunks_found": len(filtered_chunks),
                    "language": gemini_response.get("language", "English"),
                    "language_code": target_language
                }
        
        # Generate audio if requested and Murf client is available
        audio_result = None
        if generate_audio_flag and murf_client and ai_response.get("success") and ai_response.get("answer"):
            print("Generating audio in {target_language} for AI response...")
            audio_result = murf_client.generate_audio(ai_response["answer"], voice_id)
        
        # Combine response
        result = {
            **ai_response,
            "audio": audio_result,
            "voice_used": voice_id if audio_result else None
        }
        
        return result
        
    except Exception as e:
        print(f"Ask with audio error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.delete("/books/{book_id}")
async def delete_book(book_id: str):
    """Delete a book and all its associated chunks"""
    try:
        books_collection = database.get_books_collection()
        chunks_collection = database.get_chunks_collection()
        
        # Check if book exists
        book = books_collection.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Delete all chunks for this book first
        chunks_result = chunks_collection.delete_many({"book_id": book_id})
        
        # Delete the book
        books_result = books_collection.delete_one({"_id": ObjectId(book_id)})
        
        return {
            "success": True,
            "message": f"Successfully deleted book: {book['filename']}",
            "book_id": book_id,
            "chunks_deleted": chunks_result.deleted_count,
            "book_deleted": books_result.deleted_count > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting book: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)