from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TimeGranularity(str, Enum):
    """Time granularity for analytics"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class DensityMetrics(BaseModel):
    """Density metrics"""
    average_density: float
    peak_density: float
    min_density: float
    median_density: float
    std_deviation: float
    total_readings: int


class PeakHourData(BaseModel):
    """Peak hour information"""
    hour: int
    day_of_week: str
    average_density: float
    peak_density: float
    alert_count: int


class CameraAnalytics(BaseModel):
    """Analytics for specific camera"""
    camera_id: str
    camera_name: str
    location: str
    capacity: int
    density_metrics: DensityMetrics
    peak_hours: List[PeakHourData]
    trend: Optional[str] = None
    risk_level: str


class SystemAnalytics(BaseModel):
    """System-wide analytics"""
    period_hours: int
    total_cameras: int
    active_cameras: int
    total_detections: int
    total_alerts: int
    average_system_density: float
    peak_system_density: float
    critical_events: int
    high_events: int
    generated_at: datetime


class ComplianceReport(BaseModel):
    """Compliance and privacy report"""
    report_period: str
    data_retention_days: int
    frame_data_anonymized: bool
    pii_data_removed: bool
    ai_model_compliance: bool
    encryption_enabled: bool
    audit_logs_enabled: bool
    generated_at: datetime
    next_review_date: datetime


class DataRetentionPolicy(BaseModel):
    """Data retention configuration"""
    detection_logs_retention_days: int = Field(90, ge=7, le=365)
    alert_logs_retention_days: int = Field(180, ge=7, le=365)
    audit_logs_retention_days: int = Field(365, ge=30, le=730)
    frame_data_retention_days: int = Field(30, ge=1, le=90)
    auto_delete_enabled: bool = True


class AccessLog(BaseModel):
    """API access log"""
    user_id: str
    endpoint: str
    method: str
    timestamp: datetime
    response_time_ms: int
    status_code: int
    ip_address: str


class AuditLog(BaseModel):
    """Audit log for actions"""
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    changes: Optional[dict] = None
    timestamp: datetime
    status: str


class AnonymizedDataRequest(BaseModel):
    """Request for anonymized data"""
    include_aggregations: bool = True
    include_trends: bool = True
    include_statistics: bool = True
    exclude_pii: bool = True
    format: Optional[str] = "json"


class PerformanceMetrics(BaseModel):
    """API performance metrics"""
    endpoint: str
    method: str
    total_requests: int
    avg_response_time_ms: float
    min_response_time_ms: int
    max_response_time_ms: int
    error_rate_percent: float
    last_24h_requests: int


class DataQualityReport(BaseModel):
    """Data quality metrics"""
    total_records: int
    valid_records: int
    invalid_records: int
    missing_fields: int
    duplicate_records: int
    data_quality_score: float
    last_validation: datetime
