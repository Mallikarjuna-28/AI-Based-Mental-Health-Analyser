from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.database import get_user_by_email, create_user, update_user_profile

router = APIRouter(prefix="/users", tags=["Users"])

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    gender: Optional[str] = None

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    existing_user = await get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user_doc = {
        "name": user_in.name,
        "email": user_in.email,
        "hashed_password": hashed_pwd,
        "age": None,
        "gender": None
    }
    
    user = await create_user(user_doc)
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.post("/login")
async def login(user_in: UserLogin):
    user = await get_user_by_email(user_in.email)
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.get("/me")
async def read_current_user(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "id": current_user.get("id") or str(current_user.get("_id")),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "age": current_user.get("age"),
        "gender": current_user.get("gender")
    }

@router.put("/profile")
async def update_profile(
    profile_in: UserProfileUpdate, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user.get("id") or str(current_user.get("_id"))
    
    updates = {}
    if profile_in.name is not None:
        updates["name"] = profile_in.name
    if profile_in.email is not None:
        # Check if email is already taken by someone else
        if profile_in.email != current_user["email"]:
            existing_user = await get_user_by_email(profile_in.email)
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already taken by another user.")
            updates["email"] = profile_in.email
    if profile_in.age is not None:
        updates["age"] = profile_in.age
    if profile_in.gender is not None:
        updates["gender"] = profile_in.gender
        
    updated_user = await update_user_profile(user_id, updates)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update profile.")
        
    return {
        "id": updated_user.get("id") or str(updated_user.get("_id")),
        "name": updated_user.get("name"),
        "email": updated_user.get("email"),
        "age": updated_user.get("age"),
        "gender": updated_user.get("gender")
    }
