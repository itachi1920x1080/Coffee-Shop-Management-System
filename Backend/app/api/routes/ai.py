import os
import json
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()

class AIGenerateRequest(BaseModel):
    category: str

@router.post("/generate-menu")
def generate_menu_items(data: AIGenerateRequest):
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
             raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
        
        client = genai.Client(api_key=api_key)
        
        shop_context = "You are a helpful assistant for a coffee shop management system. Return ONLY a valid JSON array of strings containing just the product names. Do not include prices or descriptions. Do not include any markdown or extra text. Example: [\"Product 1\", \"Product 2\"]"
        prompt = f"Generate 3 to 5 menu items for a coffee shop category named '{data.category}'."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=shop_context,
                temperature=0.7
            )
        )
        text_response = response.text.strip()
        
        # Clean Markdown formatting if AI sends it
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.startswith("```"):
            text_response = text_response[3:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
        
        items = json.loads(text_response.strip())
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI items: {str(e)}")


class AIDescriptionRequest(BaseModel):
    name: str
    type: str # "category" or "menu"

@router.post("/generate-description")
def generate_description(data: AIDescriptionRequest):
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
             raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
        
        client = genai.Client(api_key=api_key)
        
        shop_context = "You are a professional copywriter for a coffee shop. Write a short, appetizing, and appealing description (maximum 2 sentences) for the given item. Keep it concise."
        prompt = f"Write a description for a coffee shop {data.type} named '{data.name}'."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=shop_context,
                temperature=0.7
            )
        )
        return {"description": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate description: {str(e)}")
