from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DetectionRequest(BaseModel):
    """Detection request - contains frame data"""
    camera_id: str
    people_count: int = Field(..., ge=0)
    density_percentage: float = Field(..., ge=0)
    density_level: str = Field(pattern="^(low|medium|high|critical)$")
    risk_score: float = Field(..., ge=0, le=1.0)
    frame_data: Optional[dict] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "camera_id": "507f1f77bcf86cd799439011",
                "people_count": 85,
                "density_percentage": 85.0,
                "density_level": "high",
                "risk_score": 0.85
            }
        }

class DetectionResponse(BaseModel):
    """Detection response"""
    id: str = Field(alias="_id")
    camera_id: str
    people_count: int
    density_percentage: float
    density_level: str
    risk_score: float
    alert_generated: bool
    timestamp: datetime
    
    class Config:
        populate_by_name = True

class LiveDetectionResponse(BaseModel):
    """Live detection response with camera info"""
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

class DensityTrendResponse(BaseModel):
    """Density trend response for analytics"""
    camera_id: str
    camera_name: str
    location: str
    average_density: float
    peak_density: float
    min_density: float
    total_readings: int
    high_alert_count: int
    critical_alert_count: int
    period: str  # "hour", "day", "week"
