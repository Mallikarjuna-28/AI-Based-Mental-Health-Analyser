import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import motor.motor_asyncio
from app.config import settings

# In-memory and local JSON file persistence details
JSON_DB_PATH = "local_db.json"

class JSONDatabase:
    def __init__(self, path: str):
        self.path = path
        self.data: Dict[str, List[Any]] = {
            "users": [],
            "facial_results": [],
            "voice_results": [],
            "text_results": [],
            "questionnaire_results": [],
            "chat_history": [],
            "reports": []
        }
        self.load()

    def load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content.strip():
                        loaded_data = json.loads(content)
                        for key in self.data.keys():
                            if key in loaded_data:
                                self.data[key] = loaded_data[key]
            except Exception as e:
                print(f"Error loading JSON database: {e}")

    def save(self):
        try:
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, default=str, indent=2)
        except Exception as e:
            print(f"Error writing to JSON database: {e}")

    # Operations
    def insert(self, collection: str, document: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in document and "_id" not in document:
            document["id"] = str(uuid.uuid4())
        elif "_id" in document and "id" not in document:
            document["id"] = str(document["_id"])
        
        document["created_at"] = document.get("created_at", datetime.utcnow().isoformat())
        self.data[collection].append(document)
        self.save()
        return document

    def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.data[collection]:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find_many(self, collection: str, query: Dict[str, Any], sort_key: str = "created_at", reverse: bool = True) -> List[Dict[str, Any]]:
        results = []
        for doc in self.data[collection]:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        # Sort results
        try:
            results.sort(key=lambda x: x.get(sort_key, ""), reverse=reverse)
        except Exception:
            pass
        return results

# Database Client State
db_client = None
db = None
json_db = JSONDatabase(JSON_DB_PATH)
use_mongo = False

def initialize_database():
    global db_client, db, use_mongo
    if settings.MONGODB_URL:
        try:
            # Short timeout to avoid hanging startup if connection fails
            db_client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URL, 
                serverSelectionTimeoutMS=3000
            )
            # Simple ping test
            db = db_client[settings.DATABASE_NAME]
            use_mongo = True
            print("Successfully connected to MongoDB.")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}. Falling back to Local JSON database.")
            use_mongo = False
    else:
        print("MONGODB_URL not provided. Using Local JSON database fallback.")
        use_mongo = False

# Run initialization
initialize_database()

# Database Helper Functions

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    email_clean = email.strip().lower()
    if use_mongo:
        user = await db["users"].find_one({"email": email_clean})
        if user:
            user["id"] = str(user["_id"])
        return user
    else:
        return json_db.find_one("users", {"email": email_clean})

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    user_data["email"] = user_data["email"].strip().lower()
    user_data["created_at"] = datetime.utcnow()
    if use_mongo:
        result = await db["users"].insert_one(user_data)
        user_data["id"] = str(result.inserted_id)
        user_data["_id"] = str(result.inserted_id)
        return user_data
    else:
        user_data["_id"] = str(uuid.uuid4())
        return json_db.insert("users", user_data)

async def update_user_profile(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if use_mongo:
        from bson.objectid import ObjectId
        try:
            await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": updates})
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
            return user
        except Exception:
            return None
    else:
        user = json_db.find_one("users", {"id": user_id})
        if not user:
            user = json_db.find_one("users", {"_id": user_id})
        if user:
            user.update(updates)
            json_db.save()
            return user
        return None

async def save_facial_result(user_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "emotion": result["emotion"],
        "confidence": result["confidence"],
        "stress_level": result["stress_level"],
        "created_at": datetime.utcnow()
    }
    if use_mongo:
        await db["facial_results"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc
    else:
        return json_db.insert("facial_results", doc)

async def get_facial_results(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["facial_results"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
            del r["_id"]
            results.append(r)
        return results
    else:
        return json_db.find_many("facial_results", {"user_id": user_id})[:limit]

async def save_voice_result(user_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "emotion": result["emotion"],
        "confidence": result["confidence"],
        "stress_level": result["stress_level"],
        "summary": result["summary"],
        "created_at": datetime.utcnow()
    }
    if use_mongo:
        await db["voice_results"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc
    else:
        return json_db.insert("voice_results", doc)

async def get_voice_results(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["voice_results"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
            del r["_id"]
            results.append(r)
        return results
    else:
        return json_db.find_many("voice_results", {"user_id": user_id})[:limit]

async def save_text_result(user_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "sentiment": result["sentiment"],
        "stress_score": result["stress_score"],
        "keywords": result["keywords"],
        "emotion_class": result["emotion_class"],
        "created_at": datetime.utcnow()
    }
    if use_mongo:
        await db["text_results"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc
    else:
        return json_db.insert("text_results", doc)

async def get_text_results(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["text_results"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
            del r["_id"]
            results.append(r)
        return results
    else:
        return json_db.find_many("text_results", {"user_id": user_id})[:limit]

async def save_questionnaire_result(user_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "responses": result["responses"],
        "wellness_score": result["wellness_score"],
        "stress_index": result["stress_index"],
        "risk_category": result["risk_category"],
        "created_at": datetime.utcnow()
    }
    if use_mongo:
        await db["questionnaire_results"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc
    else:
        return json_db.insert("questionnaire_results", doc)

async def get_questionnaire_results(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["questionnaire_results"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
            del r["_id"]
            results.append(r)
        return results
    else:
        return json_db.find_many("questionnaire_results", {"user_id": user_id})[:limit]

async def save_chat_message(user_id: str, sender: str, message: str) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "sender": sender,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    if use_mongo:
        await db["chat_history"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc
    else:
        return json_db.insert("chat_history", doc)

async def get_chat_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["chat_history"].find({"user_id": user_id}).sort("timestamp", 1).limit(limit)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            del r["_id"]
            results.append(r)
        return results
    else:
        # Return sorted chronologically
        history = json_db.find_many("chat_history", {"user_id": user_id})
        history.reverse()  # Since find_many sorts reverse=True, we reverse it back to chronological
        return history[-limit:]

async def save_report(user_id: str, report: Dict[str, Any]) -> Dict[str, Any]:
    doc = {
        "user_id": user_id,
        "overall_wellness_score": report["overall_wellness_score"],
        "facial_emotion": report["facial_emotion"],
        "voice_emotion": report["voice_emotion"],
        "text_sentiment": report["text_sentiment"],
        "questionnaire_score": report["questionnaire_score"],
        "chatbot_insights": report["chatbot_insights"],
        "stress_level": report["stress_level"],
        "risk_category": report["risk_category"],
        "recommendations": report["recommendations"],
        "suggested_activities": report.get("suggested_activities", []),
        "created_at": datetime.utcnow()
    }
    if use_mongo:
        await db["reports"].insert_one(doc)
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc
    else:
        return json_db.insert("reports", doc)

async def get_reports(user_id: str) -> List[Dict[str, Any]]:
    if use_mongo:
        cursor = db["reports"].find({"user_id": user_id}).sort("created_at", -1)
        results = []
        async for r in cursor:
            r["id"] = str(r["_id"])
            r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
            del r["_id"]
            results.append(r)
        return results
    else:
        return json_db.find_many("reports", {"user_id": user_id})

async def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    if use_mongo:
        from bson.objectid import ObjectId
        try:
            r = await db["reports"].find_one({"_id": ObjectId(report_id)})
            if r:
                r["id"] = str(r["_id"])
                r["created_at"] = r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"]
                del r["_id"]
            return r
        except Exception:
            return None
    else:
        r = json_db.find_one("reports", {"id": report_id})
        if not r:
            r = json_db.find_one("reports", {"_id": report_id})
        return r
