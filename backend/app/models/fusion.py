from typing import Dict, Any, List

def calculate_fusion_report(
    facial_result: Dict[str, Any],
    voice_result: Dict[str, Any],
    text_result: Dict[str, Any],
    questionnaire_result: Dict[str, Any],
    chatbot_insights_score: float
) -> Dict[str, Any]:
    """
    Report Fusion Algorithm:
    - 30% Facial Analysis
    - 25% Voice Analysis
    - 20% Text Sentiment
    - 20% Questionnaire
    - 5% Chatbot Insights
    """
    
    # 1. Facial Wellness Score (0 - 100)
    # If no facial result, assume baseline Neutral (80)
    facial_wellness = float(facial_result.get("wellness_score", 80.0))
    
    # 2. Voice Wellness Score (0 - 100)
    # If no voice result, assume baseline Calm (85)
    voice_wellness = float(voice_result.get("wellness_score", 80.0))
    
    # 3. Text Wellness Score (0 - 100)
    # Measured as 100 - stress_score
    text_stress = float(text_result.get("stress_score", 30.0))
    text_wellness = 100.0 - text_stress
    
    # 4. Questionnaire Wellness Score (0 - 100)
    questionnaire_wellness = float(questionnaire_result.get("wellness_score", 75.0))
    
    # 5. Chatbot Insights Score (0 - 100)
    chatbot_wellness = float(chatbot_insights_score)
    
    # Compute Weighted Score
    overall_wellness = (
        (0.30 * facial_wellness) +
        (0.25 * voice_wellness) +
        (0.20 * text_wellness) +
        (0.20 * questionnaire_wellness) +
        (0.05 * chatbot_wellness)
    )
    
    overall_wellness = round(overall_wellness, 2)
    
    # Risk Categories & Overall Stress Level Mapping
    if overall_wellness >= 75.0:
        risk_category = "Low Risk"
        stress_level = "Low"
        recommendations = "Your mental wellness indicators show a strong and stable state. Continue engaging in your current routine, maintaining healthy sleep cycles, and practicing mild mindfulness."
        suggested_activities = [
            "Daily 15-minute journaling or reflection.",
            "Maintaining regular outdoor walks (30 minutes).",
            "Engaging in social connections or hobbies."
        ]
    elif overall_wellness >= 50.0:
        risk_category = "Moderate Risk"
        stress_level = "Moderate"
        recommendations = "You are exhibiting mild indicators of stress, fatigue, or mood dips. We recommend setting boundaries between work and life, exploring breathing techniques, and organizing your rest cycles."
        suggested_activities = [
            "4-7-8 deep breathing exercises (5 cycles daily).",
            "Limiting screen time 1 hour before bed.",
            "Progressive muscle relaxation (PMR)."
        ]
    else:
        risk_category = "High Risk"
        stress_level = "High"
        recommendations = "Your wellness scores indicate elevated stress and lower emotional resilience. It is highly recommended to seek professional support, reduce immediate workloads, and practice intensive mindfulness and self-care."
        suggested_activities = [
            "Speaking to a mental health professional or counselor.",
            "Practicing guided mindfulness meditation (20 minutes).",
            "Ensuring a minimum of 8 hours of uninterrupted rest."
        ]
        
    return {
        "overall_wellness_score": overall_wellness,
        "risk_category": risk_category,
        "stress_level": stress_level,
        "recommendations": recommendations,
        "suggested_activities": suggested_activities
    }
