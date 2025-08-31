import requests
import os
import json
import time
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class MurfClient:
    def __init__(self):
        self.api_key = os.getenv("MURF_API_KEY")
        if not self.api_key:
            raise Exception("MURF_API_KEY not found in environment variables")
        
        self.base_url = "https://api.murf.ai/v1"
        self.headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Create audio storage directory
        self.audio_dir = "audio_files"
        os.makedirs(self.audio_dir, exist_ok=True)
        
        print("Murf AI client initialized successfully")
    
    def get_voices(self) -> Dict[str, Any]:
        """Get available voices from Murf AI"""
        try:
            response = requests.get(f"{self.base_url}/speech/voices", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting voices: {e}")
            return {"voices": []}
    
    def generate_audio(self, text: str, voice_id: str = "en-US-ken") -> Dict[str, Any]:
        """
        Generate audio from text using Murf AI
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use
            language: Language code
        Returns: Dict with audio info or error
        """
        try:

            # Get language info
            lang_info = self.get_language_from_voice(voice_id)

            # Clean text for TTS
            cleaned_text = self._clean_text_for_tts(text)
            
            if len(cleaned_text) > 3000:  # Murf has text length limits
                cleaned_text = cleaned_text[:2900] + "..."
                
            print(f"Generating audio for text length: {len(cleaned_text)} chars in {lang_info['name']}")
            
            # Prepare request payload
            payload = {
                "voiceId": voice_id,
                "text": cleaned_text,
                "rate": 0,  # Normal speed
                "pitch": 0,  # Normal pitch
                "sampleRate": 48000,
                "format": "MP3",
                "channelType": "MONO",
                "pronunciationDictionary": {},
                "encodeAsBase64": False
            }
            
            # Make request to Murf AI
            response = requests.post(
                f"{self.base_url}/speech/generate",
                headers=self.headers,
                json=payload
            )
            
            print(f"Murf API response status: {response.status_code}")
            
            if response.status_code != 200:
                error_msg = response.text
                print(f"Murf API error: {error_msg}")
                return {
                    "success": False,
                    "error": f"Murf API error: {error_msg}",
                    "audio_url": None
                }
            
            result = response.json()
            
            if "audioFile" in result:
                # Save audio file
                audio_filename = f"audio_{int(time.time())}_{voice_id.replace('-', '_')}.mp3"
                audio_path = os.path.join(self.audio_dir, audio_filename)
                
                # Download and save audio
                audio_response = requests.get(result["audioFile"])
                with open(audio_path, "wb") as f:
                    f.write(audio_response.content)
                
                return {
                    "success": True,
                    "audio_filename": audio_filename,
                    "audio_url": f"/audio/{audio_filename}",
                    "voice_id": voice_id,
                    "language": lang_info["name"],
                    "text_length": len(cleaned_text),
                    "duration_estimate": len(cleaned_text) / 150  # Rough estimate: 150 chars per minute
                }
            else:
                return {
                    "success": False,
                    "error": "No audio file in response",
                    "audio_url": None
                }
                
        except Exception as e:
            print(f"Error generating audio: {e}")
            return {
                "success": False,
                "error": str(e),
                "audio_url": None
            }
    
    def _clean_text_for_tts(self, text: str) -> str:
        """Clean text for text-to-speech conversion"""
        import re
        
        # Remove markdown formatting
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
        text = re.sub(r'`(.*?)`', r'\1', text)        # Code
        
        # Replace newlines with periods for better speech flow
        text = re.sub(r'\n+', '. ', text)
        
        # Remove excessive spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might cause TTS issues
        text = re.sub(r'[#\[\]{}()]+', '', text)
        
        # Ensure proper sentence endings
        text = re.sub(r'([.!?।])\s*([A-Za-z\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F])', r'\1 \2', text)
        
        return text.strip()
        
    def get_preset_voices(self) -> List[Dict[str, str]]:
        """Get preset voices for common languages"""
        return [
            # English Voices
            {"id": "en-US-ken", "name": "Ken (US English)", "language": "en-US", "language_name": "English"},
            {"id": "en-GB-charles", "name": "Charles (UK English)", "language": "en-GB", "language_name": "English"},
            {"id": "en-IN-ravi", "name": "Ravi (Indian English)", "language": "en-IN", "language_name": "English"},
            {"id": "en-IN-kavya", "name": "Kavya (Indian English)", "language": "en-IN", "language_name": "English"},
            
            # Indian Languages
            {"id": "hi-IN-kabir", "name": "Kabir (Hindi Male)", "language": "hi-IN", "language_name": "Hindi"},
            {"id": "hi-IN-aditi", "name": "Aditi (Hindi Female)", "language": "hi-IN", "language_name": "Hindi"},
            {"id": "hi-IN-abhishek", "name": "Abhishek (Hindi Male)", "language": "hi-IN", "language_name": "Hindi"},
            
            {"id": "ta-IN-valluvar", "name": "Valluvar (Tamil Male)", "language": "ta-IN", "language_name": "Tamil"},
            {"id": "ta-IN-meera", "name": "Meera (Tamil Female)", "language": "ta-IN", "language_name": "Tamil"},
            
            {"id": "te-IN-chaitanya", "name": "Chaitanya (Telugu Male)", "language": "te-IN", "language_name": "Telugu"},
            {"id": "te-IN-sahiti", "name": "Sahiti (Telugu Female)", "language": "te-IN", "language_name": "Telugu"},
            
            {"id": "mr-IN-manohar", "name": "Manohar (Marathi Male)", "language": "mr-IN", "language_name": "Marathi"},
            {"id": "mr-IN-aarohi", "name": "Aarohi (Marathi Female)", "language": "mr-IN", "language_name": "Marathi"},
            
            {"id": "bn-IN-indrajit", "name": "Indrajit (Bengali Male)", "language": "bn-IN", "language_name": "Bengali"},
            {"id": "bn-IN-ritika", "name": "Ritika (Bengali Female)", "language": "bn-IN", "language_name": "Bengali"},
            
        ]
    
    def get_language_from_voice(self, voice_id: str) -> Dict[str, str]:
        """Get language information from voice ID"""
        voices = self.get_preset_voices()
        for voice in voices:
            if voice["id"] == voice_id:
                return {
                    "code": voice["language"],
                    "name": voice["language_name"]
                }
        return {"code": "en-US", "name": "English"}


# Global Murf client instance
try:
    murf_client = MurfClient()
except Exception as e:
    print(f"Warning: Could not initialize Murf client: {e}")
    murf_client = None