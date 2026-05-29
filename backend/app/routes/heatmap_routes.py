from fastapi import APIRouter, HTTPException, status, Depends, Query, Path
from app.services.heatmap_service import HeatmapService
from app.middleware.auth_middleware import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/api/heatmap", tags=["Heatmap"])


@router.get("/data", response_model=dict)
async def get_heatmap_data(
    period_hours: int = Query(1, ge=1, le=168, description="Time period in hours"),
    camera_ids: Optional[List[str]] = Query(None, description="Filter by camera IDs"),
    current_user: dict = Depends(get_current_user)
):
    """Get current heatmap data with density points"""
    result = await HeatmapService.get_heatmap_data(
        period_hours=period_hours,
        camera_ids=camera_ids
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("data")}


@router.get("/summary", response_model=dict)
async def get_heatmap_summary(
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get overall heatmap summary with statistics"""
    result = await HeatmapService.get_heatmap_summary(period_hours=period_hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "summary": result.get("summary")}


@router.get("/zones/risk", response_model=dict)
async def get_zone_risk_analysis(
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get risk analysis for all zones/locations"""
    result = await HeatmapService.get_zone_risk_analysis(period_hours=period_hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "zones": result.get("zones")}


@router.get("/camera/{camera_id}/history", response_model=dict)
async def get_camera_heatmap_history(
    camera_id: str = Path(..., description="Camera ID"),
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get historical heatmap data for a specific camera"""
    result = await HeatmapService.get_camera_heatmap_history(
        camera_id=camera_id,
        period_hours=period_hours
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("data")}


@router.get("/camera/{camera_id}/trends", response_model=dict)
async def get_camera_density_trends(
    camera_id: str = Path(..., description="Camera ID"),
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    interval_minutes: int = Query(60, ge=5, le=1440, description="Aggregation interval in minutes"),
    current_user: dict = Depends(get_current_user)
):
    """Get density trends for a specific camera with time aggregation"""
    result = await HeatmapService.get_density_trends(
        camera_id=camera_id,
        period_hours=period_hours,
        interval_minutes=interval_minutes
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("data")}


@router.get("/stats/live", response_model=dict)
async def get_live_heatmap_statistics(
    current_user: dict = Depends(get_current_user)
):
    """Get live heatmap statistics"""
    result = await HeatmapService.get_heatmap_summary(period_hours=1)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "statistics": result.get("summary")}


@router.get("/health", response_model=dict)
async def heatmap_health_check(
    current_user: dict = Depends(get_current_user)
):
    """Health check for heatmap service"""
    return {
        "success": True,
        "status": "healthy",
        "service": "heatmap"
    }
