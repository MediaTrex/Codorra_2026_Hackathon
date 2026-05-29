from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    """User registration request"""
    name: str
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }

class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }

class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserAuthResponse(BaseModel):
    """User auth response"""
    id: str
    name: str
    email: str
    role: str
    access_token: str
    token_type: str = "bearer"

class CurrentUserResponse(BaseModel):
    """Current user response"""
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
