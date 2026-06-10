from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.auth import get_current_user
from app.models.facial import analyze_facial_emotion
from app.models.voice import analyze_voice_emotion
from app.models.text import analyze_text_sentiment
from app.database import (
    save_facial_result, save_voice_result, save_text_result, save_questionnaire_result,
    get_facial_results, get_voice_results, get_text_results, get_questionnaire_results
)

router = APIRouter(prefix="/analysis", tags=["Analysis"])

# Text Input Schema
class TextInput(BaseModel):
    text: str = Field(..., min_length=1, description="Text to analyze sentiment and emotion from")

# Questionnaire Input Schema
class QuestionnaireInput(BaseModel):
    sleep_quality: int = Field(..., ge=1, le=10, description="Sleep quality from 1 to 10")
    anxiety_level: int = Field(..., ge=1, le=10, description="Anxiety level from 1 to 10")
    stress_level: int = Field(..., ge=1, le=10, description="Stress level from 1 to 10")
    mood_score: int = Field(..., ge=1, le=10, description="Mood score from 1 to 10")
    energy_level: int = Field(..., ge=1, le=10, description="Energy levels from 1 to 10")
    motivation_level: int = Field(..., ge=1, le=10, description="Motivation levels from 1 to 10")

@router.post("/facial")
async def upload_facial_image(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    # Validate image extension
    filename = file.filename.lower()
    if not (filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png") or filename.endswith(".webp")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP"
        )
        
    try:
        content = await file.read()
        analysis = analyze_facial_emotion(content, filename=file.filename)
        user_id = current_user.get("id") or str(current_user.get("_id"))
        saved_doc = await save_facial_result(user_id, analysis)
        return saved_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Facial analysis failed: {str(e)}")

@router.post("/voice")
async def upload_voice_audio(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    # Validate audio extensions
    filename = file.filename.lower()
    if not (filename.endswith(".wav") or filename.endswith(".mp3") or filename.endswith(".m4a") or filename.endswith(".ogg") or filename.endswith(".webm")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio format. Supported formats: WAV, MP3, M4A, OGG, WEBM"
        )
        
    try:
        content = await file.read()
        analysis = analyze_voice_emotion(content, filename=file.filename)
        user_id = current_user.get("id") or str(current_user.get("_id"))
        saved_doc = await save_voice_result(user_id, analysis)
        return saved_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

@router.post("/text")
async def analyze_text(
    input_data: TextInput,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        analysis = analyze_text_sentiment(input_data.text)
        user_id = current_user.get("id") or str(current_user.get("_id"))
        saved_doc = await save_text_result(user_id, analysis)
        return saved_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/questionnaire")
async def analyze_questionnaire(
    survey: QuestionnaireInput,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Questionnaire Scoring Algorithm
        # Sleep, Mood, Energy, Motivation are positive indicators (higher is better)
        # Anxiety, Stress are negative indicators (higher is worse)
        # Formula: wellness_score = (Sleep + (11-Anxiety) + (11-Stress) + Mood + Energy + Motivation) / 60 * 100
        positives = survey.sleep_quality + survey.mood_score + survey.energy_level + survey.motivation_level
        negatives = (11 - survey.anxiety_level) + (11 - survey.stress_level)
        
        wellness_score = ((positives + negatives) / 60.0) * 100.0
        wellness_score = round(wellness_score, 2)
        
        # Stress index based on anxiety + stress
        stress_index = ((survey.anxiety_level + survey.stress_level) / 20.0) * 100.0
        stress_index = round(stress_index, 2)
        
        if stress_index >= 70.0:
            risk_category = "High Risk"
        elif stress_index >= 40.0:
            risk_category = "Moderate Risk"
        else:
            risk_category = "Low Risk"
            
        responses = {
            "sleep_quality": survey.sleep_quality,
            "anxiety_level": survey.anxiety_level,
            "stress_level": survey.stress_level,
            "mood_score": survey.mood_score,
            "energy_level": survey.energy_level,
            "motivation_level": survey.motivation_level
        }
        
        result = {
            "responses": responses,
            "wellness_score": wellness_score,
            "stress_index": stress_index,
            "risk_category": risk_category
        }
        
        user_id = current_user.get("id") or str(current_user.get("_id"))
        saved_doc = await save_questionnaire_result(user_id, result)
        return saved_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Questionnaire evaluation failed: {str(e)}")

@router.get("/history")
async def get_analysis_history(
    limit: int = 15,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    try:
        facial = await get_facial_results(user_id, limit)
        voice = await get_voice_results(user_id, limit)
        text = await get_text_results(user_id, limit)
        questionnaire = await get_questionnaire_results(user_id, limit)
        
        return {
            "facial": facial,
            "voice": voice,
            "text": text,
            "questionnaire": questionnaire
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load user history: {str(e)}")
