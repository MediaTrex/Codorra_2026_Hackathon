from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PrivacyLevel(str, Enum):
    """Privacy level enumeration"""
    PUBLIC = "public"
    INTERNAL = "internal"
    RESTRICTED = "restricted"
    CONFIDENTIAL = "confidential"


class PIIRemovalStrategy(str, Enum):
    """PII removal strategies"""
    HASH = "hash"
    MASK = "mask"
    ENCRYPT = "encrypt"
    DELETE = "delete"
    AGGREGATE = "aggregate"


class ConsentStatus(str, Enum):
    """Consent status"""
    GIVEN = "given"
    REVOKED = "revoked"
    PENDING = "pending"
    EXPIRED = "expired"


class DataClassification(BaseModel):
    """Data classification"""
    classification_id: str
    data_type: str
    privacy_level: PrivacyLevel
    retention_period_days: int
    requires_encryption: bool
    requires_audit_log: bool


class PIIData(BaseModel):
    """Personally Identifiable Information"""
    data_type: str
    field_name: str
    removal_strategy: PIIRemovalStrategy
    is_sensitive: bool


class PrivacyPolicy(BaseModel):
    """Privacy policy"""
    policy_id: str
    policy_name: str
    policy_version: str
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    description: str
    pii_fields: List[PIIData]
    data_classification: List[DataClassification]
    created_at: datetime


class UserConsentRecord(BaseModel):
    """User consent record"""
    user_id: str
    consent_type: str
    status: ConsentStatus
    given_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    consent_version: str


class DataAnonymizationLog(BaseModel):
    """Data anonymization log"""
    anonymization_id: str
    data_type: str
    record_count: int
    strategy_used: PIIRemovalStrategy
    completed_at: datetime
    status: str


class PrivacyAuditLog(BaseModel):
    """Privacy audit log"""
    log_id: str
    user_id: str
    action: str
    data_accessed: str
    timestamp: datetime
    ip_address: str
    status: str
    reason: Optional[str] = None


class DataExportRequest(BaseModel):
    """Data export request (Right to Access)"""
    request_id: str
    user_id: str
    export_format: str
    data_types: List[str]
    requested_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    download_url: Optional[str] = None


class DataDeletionRequest(BaseModel):
    """Data deletion request (Right to be Forgotten)"""
    request_id: str
    user_id: str
    reason: str
    requested_at: datetime
    deletion_scheduled_at: datetime
    status: str
    deleted_records: Optional[int] = None


class EncryptionConfig(BaseModel):
    """Encryption configuration"""
    encryption_enabled: bool
    algorithm: str
    key_rotation_days: int
    algorithm_version: str
    last_rotated: Optional[datetime] = None


class AccessControlPolicy(BaseModel):
    """Access control policy"""
    policy_id: str
    role: str
    allowed_endpoints: List[str]
    allowed_actions: List[str]
    data_access_restrictions: Optional[dict] = None
    created_at: datetime


class AnonymizationStatus(BaseModel):
    """Anonymization status"""
    total_records: int
    anonymized_records: int
    pii_removed_percent: float
    last_anonymization_run: datetime
    next_scheduled_run: datetime
