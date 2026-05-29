from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class HeatmapPoint(BaseModel):
    """Individual heatmap point"""
    latitude: float
    longitude: float
    intensity: float = Field(..., ge=0, le=1)
    camera_id: Optional[str] = None
    camera_name: Optional[str] = None
    people_count: Optional[int] = None
    density_percentage: Optional[float] = None
    timestamp: datetime


class HeatmapResponse(BaseModel):
    """Heatmap response model"""
    generated_at: datetime
    period_hours: int
    total_cameras: int
    points: List[HeatmapPoint]
    bounds: Optional[dict] = None

    class Config:
        use_enum_values = True


class ZoneRiskResponse(BaseModel):
    """Zone risk analysis response"""
    zone_id: str
    zone_name: Optional[str] = None
    average_density: float
    peak_density: float
    min_density: float
    risk_level: RiskLevel
    camera_count: int
    cameras: List[dict]
    total_readings: int
    high_alert_count: int
    critical_alert_count: int

    class Config:
        use_enum_values = True


class DensityTimeSeries(BaseModel):
    """Density data point in time series"""
    timestamp: datetime
    density_percentage: float
    people_count: int
    density_level: str
    risk_score: float


class CameraHeatmapData(BaseModel):
    """Heatmap data for a specific camera"""
    camera_id: str
    camera_name: str
    location: str
    latitude: float
    longitude: float
    current_density: float
    current_people_count: int
    average_density: float
    peak_density: float
    risk_level: RiskLevel
    trend: Optional[str] = None

    class Config:
        use_enum_values = True


class HeatmapHistoryResponse(BaseModel):
    """Heatmap history response"""
    camera_id: str
    camera_name: str
    period_hours: int
    data_points: List[DensityTimeSeries]
    average_density: float
    peak_density: float
    min_density: float
    total_readings: int


class HeatmapSummary(BaseModel):
    """Overall heatmap summary"""
    total_cameras: int
    active_cameras: int
    average_system_density: float
    peak_system_density: float
    high_risk_zones: int
    critical_risk_zones: int
    total_alerts: int
    active_alerts: int
    generated_at: datetime
    period_hours: int
