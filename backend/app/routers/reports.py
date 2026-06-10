from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any, List
import io
import csv
from app.auth import get_current_user
from app.database import (
    get_facial_results, get_voice_results, get_text_results, get_questionnaire_results,
    get_chat_history, save_report, get_reports, get_report_by_id
)
from app.models.fusion import calculate_fusion_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
async def generate_user_report(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    
    # 1. Fetch latest results
    facial_list = await get_facial_results(user_id, limit=1)
    voice_list = await get_voice_results(user_id, limit=1)
    text_list = await get_text_results(user_id, limit=1)
    quest_list = await get_questionnaire_results(user_id, limit=1)
    chat_logs = await get_chat_history(user_id, limit=10)
    
    # Check if we have any results at all
    if not (facial_list or voice_list or text_list or quest_list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate final report. Please complete at least one of the analysis modules (Facial, Voice, Text, or Questionnaire) first."
        )
        
    # Get values or default placeholders
    latest_facial = facial_list[0] if facial_list else {
        "emotion": "Neutral", "confidence": 80.0, "stress_level": "Low", "wellness_score": 80.0, "interpretation": "No facial scans recorded. Using baseline."
    }
    
    latest_voice = voice_list[0] if voice_list else {
        "emotion": "Neutral", "confidence": 80.0, "stress_level": "Low", "wellness_score": 80.0, "summary": "No voice files analyzed. Using baseline."
    }
    
    latest_text = text_list[0] if text_list else {
        "sentiment": "Neutral", "stress_score": 30.0, "keywords": [], "emotion_class": "Calm"
    }
    
    latest_quest = quest_list[0] if quest_list else {
        "wellness_score": 75.0, "stress_index": 25.0, "risk_category": "Low Risk", "responses": {}
    }
    
    # Compute Chatbot insights score (mined from user text replies)
    # Default is 80.0. For every sad, angry, stressed word, deduct 5. For positive words, add 2.
    chatbot_score = 80.0
    if chat_logs:
        user_messages = [msg["message"].lower() for msg in chat_logs if msg.get("sender") == "user"]
        negative_words = ["sad", "depressed", "stress", "anxious", "anxiety", "pain", "hurt", "hate", "mad", "angry", "panic", "gloomy"]
        positive_words = ["happy", "good", "great", "wonderful", "calm", "relax", "excited", "content", "peace"]
        
        matches_neg = sum(1 for msg in user_messages for word in negative_words if word in msg)
        matches_pos = sum(1 for msg in user_messages for word in positive_words if word in msg)
        
        chatbot_score = max(20.0, min(100.0, chatbot_score - (matches_neg * 6) + (matches_pos * 3)))
        
    # Run the fusion algorithm
    report_analysis = calculate_fusion_report(
        latest_facial,
        latest_voice,
        latest_text,
        latest_quest,
        chatbot_score
    )
    
    # Package final report payload
    report_doc = {
        "overall_wellness_score": report_analysis["overall_wellness_score"],
        "facial_emotion": f"{latest_facial['emotion']} (Conf: {latest_facial['confidence']}%, Stress: {latest_facial['stress_level']})",
        "voice_emotion": f"{latest_voice['emotion']} (Conf: {latest_voice['confidence']}%, Stress: {latest_voice['stress_level']})",
        "text_sentiment": f"{latest_text['sentiment']} (Stress: {latest_text['stress_score']}%, Emotion: {latest_text['emotion_class']})",
        "questionnaire_score": f"Wellness: {latest_quest['wellness_score']}%, Stress Index: {latest_quest['stress_index']}%",
        "chatbot_insights": f"Derived Interaction Index: {chatbot_score}%",
        "stress_level": report_analysis["stress_level"],
        "risk_category": report_analysis["risk_category"],
        "recommendations": report_analysis["recommendations"],
        "suggested_activities": report_analysis["suggested_activities"]
    }
    
    saved_report = await save_report(user_id, report_doc)
    return saved_report

@router.get("/history")
async def get_report_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    try:
        history = await get_reports(user_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report history: {str(e)}")

@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
        
    # Verify ownership
    user_id = current_user.get("id") or str(current_user.get("_id"))
    if report.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        
    return report

@router.get("/{report_id}/csv")
async def export_report_csv(
    report_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    # Verify ownership
    user_id = current_user.get("id") or str(current_user.get("_id"))
    if report.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
        
    # Generate CSV stream
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Mental Health Analysis Report Details", ""])
    writer.writerow(["Generated Date", report.get("created_at")])
    writer.writerow(["Report ID", report.get("id")])
    writer.writerow(["User ID", report.get("user_id")])
    writer.writerow([])
    writer.writerow(["METRIC/MODULE", "ANALYSIS RESULTS"])
    writer.writerow(["Overall Wellness Score", f"{report.get('overall_wellness_score')}%"])
    writer.writerow(["Stress Level", report.get("stress_level")])
    writer.writerow(["Risk Category", report.get("risk_category")])
    writer.writerow(["Facial Analysis Result", report.get("facial_emotion")])
    writer.writerow(["Voice Analysis Result", report.get("voice_emotion")])
    writer.writerow(["Text Sentiment Result", report.get("text_sentiment")])
    writer.writerow(["Questionnaire Result", report.get("questionnaire_score")])
    writer.writerow(["Chatbot Insights", report.get("chatbot_insights")])
    writer.writerow([])
    writer.writerow(["Clinical Recommendations", report.get("recommendations")])
    writer.writerow(["Suggested Activities", ", ".join(report.get("suggested_activities", []))])
    
    output.seek(0)
    
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")), 
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=mental_health_report_{report_id}.csv"
    return response
