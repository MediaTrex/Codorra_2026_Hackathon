from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.detection_schema import DetectionRequest
from app.services.detection_service import DetectionService
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/detections", tags=["Detections"])

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_detection(
    detection_data: DetectionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Log a detection (from AI engine)"""
    result = await DetectionService.create_detection(detection_data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    
    return result

@router.get("/live", response_model=dict, status_code=status.HTTP_200_OK)
async def live_detections(current_user: dict = Depends(get_current_user)):
    """Get latest detection per camera"""
    result = await DetectionService.get_live_detections()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return result

@router.get("/{camera_id}/history", response_model=dict, status_code=status.HTTP_200_OK)
async def camera_history(
    camera_id: str,
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """Get detection history for a camera"""
    result = await DetectionService.get_camera_detections(camera_id, limit)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return result

@router.get("/{camera_id}/trends", response_model=dict, status_code=status.HTTP_200_OK)
async def camera_trends(
    camera_id: str,
    hours: int = Query(24, ge=1, le=168),
    current_user: dict = Depends(get_current_user)
):
    """Get density trends for a camera over last N hours"""
    result = await DetectionService.get_density_trends(camera_id, period_hours=hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return result
