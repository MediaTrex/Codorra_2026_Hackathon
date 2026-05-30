from fastapi import APIRouter, HTTPException, status, Depends, Path, Query
from app.services.alert_service import AlertService
from app.middleware.auth_middleware import get_current_user
from app.config.database import get_collection
from bson import ObjectId
from app.schemas.alert_schema import (
    ResolveAlertRequest, AcknowledgeAlertRequest, DismissAlertRequest, 
    CreateAlertRequest, AlertResponse, AlertStatisticsResponse
)

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/", response_model=dict)
async def list_alerts(
    status: str | None = Query(None, description="Filter by status"),
    severity: str | None = Query(None, description="Filter by severity"),
    camera_id: str | None = Query(None, description="Filter by camera"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """List all alerts with optional filters"""
    result = await AlertService.list_alerts(
        status=status, severity=severity, camera_id=camera_id, limit=limit, skip=skip
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    return {"success": True, "total": result.get("total"), "alerts": result.get("alerts")}


@router.get("/statistics", response_model=dict)
async def get_alert_statistics(
    period_hours: int = Query(24, ge=1, le=720),
    current_user: dict = Depends(get_current_user)
):
    """Get alert statistics for a period"""
    result = await AlertService.get_alert_statistics(period_hours=period_hours)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    return result


@router.get("/{alert_id}", response_model=dict)
async def get_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific alert"""
    result = await AlertService.get_alert(alert_id)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    return {"success": True, "alert": result.get("alert")}


@router.post("/{alert_id}/resolve", response_model=dict)
async def resolve_alert(
    alert_id: str = Path(..., description="Alert ID"),
    payload: ResolveAlertRequest = None,
    current_user: dict = Depends(get_current_user)
):
    """Resolve an alert"""
    payload = payload or ResolveAlertRequest()
    result = await AlertService.resolve_alert(
        alert_id, 
        resolved_by=str(current_user.get("_id")),
        note=payload.note
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    return {"success": True, "message": result.get("message")}


@router.post("/{alert_id}/acknowledge", response_model=dict)
async def acknowledge_alert(
    alert_id: str = Path(..., description="Alert ID"),
    payload: AcknowledgeAlertRequest = None,
    current_user: dict = Depends(get_current_user)
):
    """Acknowledge an alert"""
    payload = payload or AcknowledgeAlertRequest()
    result = await AlertService.acknowledge_alert(
        alert_id,
        acknowledged_by=str(current_user.get("_id")),
        note=payload.note
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    return {"success": True, "message": result.get("message")}


@router.post("/{alert_id}/dismiss", response_model=dict)
async def dismiss_alert(
    alert_id: str = Path(..., description="Alert ID"),
    payload: DismissAlertRequest = None,
    current_user: dict = Depends(get_current_user)
):
    """Dismiss an alert"""
    payload = payload or DismissAlertRequest()
    result = await AlertService.dismiss_alert(
        alert_id,
        dismissed_by=str(current_user.get("_id")),
        reason=payload.reason
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    return {"success": True, "message": result.get("message")}


@router.post("/bulk/resolve", response_model=dict)
async def bulk_resolve_alerts(
    alert_ids: list[str],
    note: str | None = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Resolve multiple alerts at once"""
    result = await AlertService.bulk_resolve_alerts(
        alert_ids,
        resolved_by=str(current_user.get("_id")),
        note=note
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    return result


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: CreateAlertRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new alert (from AI engine)"""
    cameras_col = await get_collection("cameras")
    camera = await cameras_col.find_one({"_id": ObjectId(payload.camera_id)}) if ObjectId.is_valid(payload.camera_id) else None
    
    camera_name = camera.get("name") if camera else "Unknown Camera"
    location = camera.get("location") if camera else "Unknown Location"
    
    result = await AlertService.create_alert(
        camera_id=payload.camera_id,
        alert_type=payload.type,
        severity=payload.severity,
        title=payload.title,
        message=payload.message,
        people_count=payload.people_count,
        density_percentage=payload.density_percentage,
        camera_name=camera_name,
        location=location,
        frame_data=payload.frame_data
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    return result


