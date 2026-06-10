from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List
from app.auth import get_current_user
from app.database import save_chat_message, get_chat_history
from app.models.text import analyze_text_sentiment

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatMessageInput(BaseModel):
    message: str
    language: str = "English"  # "English", "Telugu", "Hindi"

# Pre-defined professional emotion-aware multilingual chatbot responses
RESPONSES = {
    "English": {
        "Joy": "That is wonderful to hear! Maintaining a positive state of mind is excellent. What made you happy today?",
        "Calm": "I am here to support your mental wellness. How are you feeling today? Feel free to share your thoughts.",
        "Sadness": "I am really sorry you are feeling down. It is completely okay to feel sad. I am here to support you. Would you like to share what's on your mind?",
        "Fear": "I hear you. It sounds like you are feeling anxious or stressed. Let's do a simple grounding exercise: Take a slow deep breath. Breathe in for 4 seconds, hold for 7, and exhale slowly for 8 seconds. You're doing great.",
        "Anger": "It sounds like you are experiencing some frustration or anger. It's completely valid to feel this way. Let's take a brief step back. What do you think is triggering this tension?"
    },
    "Hindi": {
        "Joy": "यह सुनकर बहुत अच्छा लगा! सकारात्मक मनःस्थिति बनाए रखना बहुत ही बेहतरीन है। आज आपको किस बात ने खुशी दी?",
        "Calm": "मैं आपकी मानसिक तंदुरुस्ती में मदद करने के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं? अपने विचार साझा करें।",
        "Sadness": "मुझे बहुत खेद है कि आप उदास महसूस कर रहे हैं। उदास महसूस करना पूरी तरह से सामान्य है। मैं यहाँ आपके समर्थन के लिए हूँ। क्या आप साझा करना चाहेंगे?",
        "Fear": "मैं समझ सकता हूँ। ऐसा लग रहा है कि आप चिंतित या तनाव में हैं। आइए एक साधारण प्राणायाम करें: गहरी सांस लें। 4 सेकंड के लिए सांस लें, 7 सेकंड रोकें, और 8 सेकंड में धीरे-धीरे छोड़ें। आप बहुत अच्छा कर रहे हैं।",
        "Anger": "ऐसा लगता है कि आप कुछ हताशा या क्रोध महसूस कर रहे हैं। ऐसा महसूस होना बिल्कुल स्वाभाविक है। आइए थोड़ा ठहरें और सांस लें। आपको क्या लगता है कि इस तनाव का क्या कारण है?"
    },
    "Telugu": {
        "Joy": "ఇది వినడానికి చాలా సంతోషంగా ఉంది! సానుకూల మానసిక స్థితిని కలిగి ఉండటం చాలా గొప్ప విషయం. ఈ రోజు మిమ్మల్ని సంతోషపెట్టినది ఏమిటి?",
        "Calm": "మీ మానసిక ఆరోగ్యానికి మద్దతు ఇవ్వడానికి నేను ఇక్కడ ఉన్నాను. ఈ రోజు మీరు ఎలా ఉన్నారు? మీ ఆలోచనలను నాతో పంచుకోండి.",
        "Sadness": "మీరు బాధపడుతున్నందుకు నాకు చాలా విచారంగా ఉంది. బాధగా అనిపించడం సహజం. నేను మీకు తోడుగా ఉంటాను. మీ మనస్సులో ఏముందో పంచుకోవాలనుకుంటున్నారా?",
        "Fear": "నేను అర్థం చేసుకోగలను. మీరు ఆందోళనగా లేదా ఒత్తిడిగా ఉన్నట్లు అనిపిస్తుంది. ఒక చిన్న వ్యాయామం చేద్దాం: ఒకసారి నిదానంగా ఊపిరి తీసుకోండి. 4 సెకన్లు శ్వాస పీల్చండి, 7 సెకన్లు ఆపండి, 8 సెకన్లలో నెమ్మదిగా వదిలేయండి. మీరు చాలా బాగా చేస్తున్నారు.",
        "Anger": "మీరు కొంత కోపంగా లేదా అసహనంగా ఉన్నట్లు అనిపిస్తుంది. అలా అనిపించడం సహజమే. ఒకసారి నిదానంగా ఆలోచించండి. ఈ ఒత్తిడికి గల కారణాన్ని పంచుకోగలరా?"
    }
}

@router.post("/message")
async def send_chatbot_message(
    input_data: ChatMessageInput,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    user_msg = input_data.message.strip()
    
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    try:
        # Save user message
        await save_chat_message(user_id, "user", user_msg)
        
        # Analyze user message sentiment to determine emotional category
        analysis = analyze_text_sentiment(user_msg)
        emotion = analysis.get("emotion_class", "Calm")
        
        # Select appropriate language responses
        lang = input_data.language if input_data.language in RESPONSES else "English"
        bot_response = RESPONSES[lang].get(emotion, RESPONSES[lang]["Calm"])
        
        # Save bot response
        await save_chat_message(user_id, "bot", bot_response)
        
        return {
            "response": bot_response,
            "detected_emotion": emotion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot message processing failed: {str(e)}")

@router.get("/history")
async def get_chatbot_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    try:
        history = await get_chat_history(user_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat logs: {str(e)}")
