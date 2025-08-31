import google.generativeai as genai
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise Exception("GEMINI_API_KEY not found in environment variables")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-1.5-flash')

        # Language mappings for prompts
        self.language_prompts = {
            "hi-IN": {
                "name": "Hindi",
                "instruction": "Please respond in Hindi (हिंदी में जवाब दें)",
                "educational_note": "Provide an educational explanation suitable for Indian students"
            },
            "ta-IN": {
                "name": "Tamil", 
                "instruction": "Please respond in Tamil (தமிழில் பதில் அளிக்கவும்)",
                "educational_note": "Provide an educational explanation suitable for Tamil students"
            },
            "te-IN": {
                "name": "Telugu",
                "instruction": "Please respond in Telugu (తెలుగులో సమాధానం ఇవ్వండి)",
                "educational_note": "Provide an educational explanation suitable for Telugu students"
            },
            "mr-IN": {
                "name": "Marathi",
                "instruction": "Please respond in Marathi (मराठीत उत्तर द्या)",
                "educational_note": "Provide an educational explanation suitable for Marathi students"
            },
            "bn-IN": {
                "name": "Bengali",
                "instruction": "Please respond in Bengali (বাংলায় উত্তর দিন)",
                "educational_note": "Provide an educational explanation suitable for Bengali students"
            },
            "gu-IN": {
                "name": "Gujarati",
                "instruction": "Please respond in Gujarati (ગુજરાતીમાં જવાબ આપો)",
                "educational_note": "Provide an educational explanation suitable for Gujarati students"
            },
            "kn-IN": {
                "name": "Kannada",
                "instruction": "Please respond in Kannada (ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ)",
                "educational_note": "Provide an educational explanation suitable for Kannada students"
            },
            "ml-IN": {
                "name": "Malayalam",
                "instruction": "Please respond in Malayalam (മലയാളത്തിൽ ഉത്തരം നൽകുക)",
                "educational_note": "Provide an educational explanation suitable for Malayalam students"
            },
            "en-US": {
                "name": "English",
                "instruction": "Please respond in English",
                "educational_note": "Provide a clear educational explanation"
            },
            "en-GB": {
                "name": "English",
                "instruction": "Please respond in English",
                "educational_note": "Provide a clear educational explanation"
            },
            "en-IN": {
                "name": "English",
                "instruction": "Please respond in English with Indian context where applicable",
                "educational_note": "Provide an educational explanation suitable for Indian students"
            }
        } 


        print("Gemini client initialized successfully")
    
    def _create_multilingual_educational_prompt(self, query: str, context: str, lang_info: Dict[str, str]) -> str:
        """Create a language-specific educational prompt for Gemini"""
        
        prompt = f"""You are an educational AI assistant helping students understand textbook content.

IMPORTANT LANGUAGE INSTRUCTION: {lang_info['instruction']}
{lang_info['educational_note']}

User Question: {query}

Relevant Textbook Content:
{context}

Instructions:
1. {lang_info['instruction']} - This is very important!
2. Provide a clear, educational answer based ONLY on the textbook content provided above
3. Explain concepts in a way that's easy to understand for students
4. If the content covers multiple aspects, organize your response with clear sections
5. If you need to make connections between different sources, explain them clearly
6. If the provided content doesn't fully answer the question, say so and explain what information is available
7. Use examples from the textbook content when possible
8. Keep your response focused and relevant to the student's question
9. Use appropriate academic terminology for the target language
10. Maintain educational tone throughout the response

Educational Response ({lang_info['name']}):"""
        
        return prompt
    
    def generate_simple_response(self, query: str, target_language: str = "en-US") -> str:
        """Generate a simple response without context in specified language"""
        try:
            lang_info = self.language_prompts.get(target_language, self.language_prompts["en-US"])
            
            prompt = f"""IMPORTANT: {lang_info['instruction']}

Provide a brief, educational explanation for: {query}

Requirements:
- {lang_info['instruction']}
- Keep the response concise and student-friendly
- Use appropriate academic terminology
- {lang_info['educational_note']}

Response in {lang_info['name']}:"""
            
            response = self.model.generate_content(prompt)
            return response.text if response.text else f"I couldn't generate a response in {lang_info['name']}."
            
        except Exception as e:
            lang_name = self.language_prompts.get(target_language, {}).get("name", "English")
            return f"Error generating {lang_name} response: {str(e)}"
    
    # gemini_client.py

# ... (existing imports and GeminiClient class definition) ...

    def generate_educational_response(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        book_filenames: List[str] = None,
        target_language: str = "en-US"
    ) -> Dict[str, Any]:
        """
        Generate an educational response using retrieved context from textbooks.
        """
        try:
            # 1. Get language settings
            lang_info = self.language_prompts.get(target_language, self.language_prompts["en-US"])
            
            # Handle case where no chunks are found
            if not chunks:
                simple_response =self.generate_simple_response(query, target_language)
                return {
                    "success": True,
                    "answer": simple_response,
                    "note": "No relevant textbook content found. Generated a general response."
                }
            # 2. Build the context string
            context_string = self._build_context(chunks, book_filenames)
            
            # 3. Create the full educational prompt
            prompt = self._create_multilingual_educational_prompt(query, context_string, lang_info)

            # 4. Call the Gemini API
            print(f"Sending prompt to Gemini for language: {lang_info['name']}")
            response = self.model.generate_content(prompt)
            
            # Return the response text
            final_answer= response.text if response.text else f"I couldn't generate a specific response in {lang_info['name']} based on the provided content."
            
            return {
                "success": True,
                "answer": final_answer,
                "note": None
            }



        except Exception as e:
            lang_name = self.language_prompts.get(target_language, {}).get("name", "English")
            error_message = f"Error generating educational response in {lang_name}: {str(e)}"
            print(error_message)
            return {"success": False,
                "answer": error_message,
                "note": "An error occurred while generating the AI response."}
        
    def _build_context(self, chunks: List[Dict[str, Any]], book_filenames: List[str] = None) -> str:
        """Build context string from relevant chunks"""
        context_parts = []
        
        for i, chunk in enumerate(chunks):
            chunk_info = f"Source {i+1}"
            if book_filenames and i < len(book_filenames):
                chunk_info += f" (from {book_filenames[i]})"
            
            if chunk.get('chapter'):
                chunk_info += f" - {chunk['chapter']}"
            
            context_parts.append(f"{chunk_info}:\n{chunk['content']}\n")
        
        return "\n---\n".join(context_parts)


# Global Gemini client instance
try:
    gemini_client = GeminiClient()
except Exception as e:
    print(f"Warning: Could not initialize Gemini client: {e}")
    gemini_client = None