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

class DensityLog(BaseModel):
    """MongoDB Density/Detection Log model"""
    id: Optional[PyObjectId] = Field(alias="_id")
    camera_id: str
    people_count: int = Field(..., ge=0)
    density_percentage: float = Field(..., ge=0, le=100)
    density_level: str = Field(pattern="^(low|medium|high|critical)$")
    risk_score: float = Field(..., ge=0, le=1.0)
    alert_generated: bool = False
    frame_data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "camera_id": "507f1f77bcf86cd799439011",
                "people_count": 85,
                "density_percentage": 85.0,
                "density_level": "high",
                "risk_score": 0.85,
                "alert_generated": True
            }
        }

class DensityResponse(BaseModel):
    """Density log response model"""
    id: Optional[str] = Field(alias="_id")
    camera_id: str
    people_count: int
    density_percentage: float
    density_level: str
    risk_score: float
    alert_generated: bool
    timestamp: datetime
    
    class Config:
        populate_by_name = True

class LiveDetectionData(BaseModel):
    """Live detection data for real-time updates"""
    camera_id: str
    camera_name: str
    location: str
    people_count: int
    density_percentage: float
    density_level: str
    risk_score: float
    capacity: int
    alert_generated: bool
    timestamp: datetime
