from app.config.database import get_collection
from app.config.security import JWTHandler
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from bson import ObjectId
from datetime import datetime

class AuthService:
    """Authentication service"""
    
    @staticmethod
    async def register(user_data: RegisterRequest):
        """Register a new user"""
        try:
            users_collection = await get_collection("users")
            
            # Check if user already exists
            existing_user = await users_collection.find_one(
                {"email": user_data.email}
            )
            if existing_user:
                return {"success": False, "message": "User already exists"}
            
            # Hash password
            hashed_password = JWTHandler.hash_password(user_data.password)
            
            # Create user document
            user_doc = {
                "name": user_data.name,
                "email": user_data.email,
                "password": hashed_password,
                "role": "user",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await users_collection.insert_one(user_doc)
            
            # Create JWT token
            access_token = JWTHandler.create_access_token(
                data={"sub": str(result.inserted_id)}
            )
            
            return {
                "success": True,
                "message": "User registered successfully",
                "user_id": str(result.inserted_id),
                "name": user_data.name,
                "email": user_data.email,
                "access_token": access_token,
                "token_type": "bearer"
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    @staticmethod
    async def login(login_data: LoginRequest):
        """Login user"""
        try:
            users_collection = await get_collection("users")
            
            # Find user by email
            user = await users_collection.find_one({"email": login_data.email})
            
            if not user:
                return {"success": False, "message": "Invalid credentials"}
            
            # Verify password
            if not JWTHandler.verify_password(login_data.password, user["password"]):
                return {"success": False, "message": "Invalid credentials"}
            
            if not user.get("is_active"):
                return {"success": False, "message": "User account is inactive"}
            
            # Create JWT token
            access_token = JWTHandler.create_access_token(
                data={"sub": str(user["_id"])}
            )
            
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                },
                "access_token": access_token,
                "token_type": "bearer"
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    @staticmethod
    async def get_user(user_id: str):
        """Get user by ID"""
        try:
            users_collection = await get_collection("users")
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                return {"success": False, "message": "User not found"}
            
            return {
                "success": True,
                "user": {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "is_active": user["is_active"],
                    "created_at": user["created_at"]
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
