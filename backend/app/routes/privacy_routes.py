from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.privacy_service import PrivacyService
from app.middleware.auth_middleware import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/privacy", tags=["Privacy"])


@router.get("/compliance/report", response_model=dict)
async def get_compliance_report(
    report_period: str = Query("monthly", description="Report period: monthly, quarterly, annual"),
    current_user: dict = Depends(get_current_user)
):
    """Get compliance and privacy report"""
    result = await PrivacyService.get_compliance_report(report_period)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/data-retention/policy", response_model=dict)
async def get_data_retention_policy(
    current_user: dict = Depends(get_current_user)
):
    """Get data retention policy"""
    result = await PrivacyService.get_data_retention_policy()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/audit-logs", response_model=dict)
async def get_audit_logs(
    user_id: Optional[str] = Query(None, description="Optional filter by user ID"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs for compliance verification"""
    result = await PrivacyService.get_audit_logs(user_id, limit, skip)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/access-logs", response_model=dict)
async def get_access_logs(
    endpoint: Optional[str] = Query(None, description="Optional filter by endpoint"),
    period_hours: int = Query(24, ge=1, le=720),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user)
):
    """Get access logs for security audit"""
    result = await PrivacyService.get_access_logs(endpoint, period_hours, limit)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/anonymization/status", response_model=dict)
async def get_anonymization_status(
    current_user: dict = Depends(get_current_user)
):
    """Get status of data anonymization"""
    result = await PrivacyService.get_anonymization_status()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.post("/data/export", response_model=dict)
async def request_data_export(
    current_user: dict = Depends(get_current_user)
):
    """Request data export (GDPR Right to Access)"""
    user_id = str(current_user.get("_id"))
    result = await PrivacyService.create_data_export_request(user_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.post("/data/deletion", response_model=dict)
async def request_data_deletion(
    reason: str = Query(..., description="Reason for data deletion request"),
    current_user: dict = Depends(get_current_user)
):
    """Request data deletion (GDPR Right to be Forgotten)"""
    user_id = str(current_user.get("_id"))
    result = await PrivacyService.create_data_deletion_request(user_id, reason)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/encryption/config", response_model=dict)
async def get_encryption_config(
    current_user: dict = Depends(get_current_user)
):
    """Get encryption configuration"""
    result = await PrivacyService.get_encryption_config()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/access-control/policies", response_model=dict)
async def get_access_control_policies(
    current_user: dict = Depends(get_current_user)
):
    """Get access control policies by role"""
    result = await PrivacyService.get_access_control_policies()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/data-classification", response_model=dict)
async def get_data_classification(
    current_user: dict = Depends(get_current_user)
):
    """Get data classification scheme"""
    result = await PrivacyService.get_data_classification()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/compliance/verify", response_model=dict)
async def verify_pii_compliance(
    current_user: dict = Depends(get_current_user)
):
    """Verify PII compliance across system"""
    result = await PrivacyService.verify_pii_compliance()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result


@router.get("/health", response_model=dict)
async def privacy_health_check(
    current_user: dict = Depends(get_current_user)
):
    """Health check for privacy service"""
    return {
        "success": True,
        "status": "healthy",
        "service": "privacy"
    }
