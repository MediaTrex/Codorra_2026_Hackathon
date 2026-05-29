from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Camera(BaseModel):
    """MongoDB Camera model"""
    id: Optional[PyObjectId] = Field(alias="_id")
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    latitude: float
    longitude: float
    stream_url: str
    capacity: int = Field(..., gt=0)
    status: str = Field(default="active", pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "name": "Metro Station A",
                "location": "Downtown Metro",
                "latitude": 27.7172,
                "longitude": 85.3240,
                "stream_url": "http://camera-stream.local/stream",
                "capacity": 100,
                "status": "active",
                "description": "Main platform"
            }
        }

class CameraResponse(BaseModel):
    """Camera response model"""
    id: Optional[str] = Field(alias="_id")
    name: str
    location: str
    latitude: float
    longitude: float
    stream_url: str
    capacity: int
    status: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
