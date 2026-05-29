from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AlertStatus(str, Enum):
    """Alert status enumeration"""
    ACTIVE = "active"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"
    DISMISSED = "dismissed"


class AlertSeverity(str, Enum):
    """Alert severity enumeration"""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, Enum):
    """Alert type enumeration"""
    OVERCROWDING = "overcrowding"
    UNUSUAL_ACTIVITY = "unusual_activity"
    SYSTEM_ERROR = "system_error"
    LOW_CAPACITY = "low_capacity"


class CreateAlertRequest(BaseModel):
    """Create alert request"""
    camera_id: str
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    people_count: Optional[int] = None
    density_percentage: Optional[float] = None
    frame_data: Optional[dict] = None

    class Config:
        use_enum_values = True


class ResolveAlertRequest(BaseModel):
    """Resolve alert request"""
    note: Optional[str] = None
    resolution_status: Optional[str] = "resolved"


class AcknowledgeAlertRequest(BaseModel):
    """Acknowledge alert request"""
    note: Optional[str] = None


class DismissAlertRequest(BaseModel):
    """Dismiss alert request"""
    reason: Optional[str] = None


class AlertResponse(BaseModel):
    """Alert response model"""
    id: Optional[str] = Field(None, alias="_id")
    camera_id: str
    camera_name: Optional[str] = None
    location: Optional[str] = None
    type: str
    severity: str
    title: str
    message: str
    status: str
    people_count: Optional[int] = None
    density_percentage: Optional[float] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    acknowledge_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    dismiss_at: Optional[datetime] = None
    dismissed_by: Optional[str] = None
    resolve_note: Optional[str] = None
    acknowledge_note: Optional[str] = None
    dismiss_reason: Optional[str] = None

    class Config:
        populate_by_name = True


class AlertStatisticsResponse(BaseModel):
    """Alert statistics response"""
    total_alerts: int
    active_alerts: int
    resolved_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    by_camera: List[dict]
    by_type: List[dict]
    by_severity: List[dict]


class AlertSettingsRequest(BaseModel):
    """Alert settings configuration"""
    high_density_threshold: float = Field(70.0, ge=0, le=100)
    critical_density_threshold: float = Field(85.0, ge=0, le=100)
    alert_cooldown_minutes: int = Field(5, ge=1)
    enable_notifications: bool = True
    notification_channels: List[str] = ["dashboard"]

    class Config:
        use_enum_values = True


class AlertSettingsResponse(BaseModel):
    """Alert settings response"""
    high_density_threshold: float
    critical_density_threshold: float
    alert_cooldown_minutes: int
    enable_notifications: bool
    notification_channels: List[str]
    updated_at: datetime
