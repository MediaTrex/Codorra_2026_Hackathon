from fastapi import APIRouter, HTTPException, status, Depends, Response
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    UserAuthResponse,
    CurrentUserResponse
)
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import get_current_user
from app.config.settings import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest, response: Response):
    """Register a new user"""
    result = await AuthService.register(user_data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=result.get("access_token"),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.COOKIE_SECURE,
        httponly=settings.COOKIE_HTTPONLY,
        samesite=settings.COOKIE_SAMESITE,
    )
    
    return {
        "success": True,
        "message": result.get("message"),
        "user_id": result.get("user_id"),
        "user": {
            "id": result.get("user_id"),
            "email": result.get("email"),
            "name": result.get("name")
        }
    }

@router.post("/login", response_model=dict, status_code=status.HTTP_200_OK)
async def login(login_data: LoginRequest, response: Response):
    """Login user"""
    result = await AuthService.login(login_data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message")
        )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=result.get("access_token"),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.COOKIE_SECURE,
        httponly=settings.COOKIE_HTTPONLY,
        samesite=settings.COOKIE_SAMESITE,
    )
    
    return {
        "success": True,
        "message": result.get("message"),
        "user": result.get("user")
    }

@router.get("/me", response_model=dict, status_code=status.HTTP_200_OK)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user_id = str(current_user.get("_id"))
    result = await AuthService.get_user(user_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return {
        "success": True,
        "user": result.get("user")
    }

@router.post("/logout", response_model=dict, status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """Logout user - delete cookie"""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        secure=settings.COOKIE_SECURE,
        httponly=settings.COOKIE_HTTPONLY,
        samesite=settings.COOKIE_SAMESITE,
    )
    
    return {
        "success": True,
        "message": "Logged out successfully"
    }
