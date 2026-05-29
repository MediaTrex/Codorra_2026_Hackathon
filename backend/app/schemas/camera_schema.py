from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CreateCameraRequest(BaseModel):
    """Create camera request"""
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    latitude: float
    longitude: float
    stream_url: str
    capacity: int = Field(..., gt=0)
    description: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Metro Station A - Platform 1",
                "location": "Downtown Metro",
                "latitude": 27.7172,
                "longitude": 85.3240,
                "stream_url": "rtsp://camera.local/stream1",
                "capacity": 150,
                "description": "Main platform camera"
            }
        }

class UpdateCameraRequest(BaseModel):
    """Update camera request"""
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    stream_url: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None

class CameraListResponse(BaseModel):
    """Camera list response"""
    id: str = Field(alias="_id")
    name: str
    location: str
    latitude: float
    longitude: float
    capacity: int
    status: str
    created_at: datetime
    
    class Config:
        populate_by_name = True

class CameraDetailResponse(BaseModel):
    """Camera detail response"""
    id: str = Field(alias="_id")
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
