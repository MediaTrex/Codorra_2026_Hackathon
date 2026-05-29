"""
FastAPI integration module - Provides HTTP API endpoints for the AI Engine
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from io import BytesIO
from logger import logger
from ai_engine import get_engine
import asyncio

app = FastAPI(title="AI Engine API", version="1.0.0")

@app.on_event("startup")
async def startup():
    """Initialize AI Engine on startup"""
    logger.info("AI Engine API starting up")
    engine = get_engine()
    logger.info("AI Engine initialized successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-engine"
    }

@app.post("/api/process-frame")
async def process_frame(
    camera_id: str,
    file: UploadFile = File(...)
):
    """
    Process a single frame from camera
    
    Request: Multipart form with camera_id and image file
    Response: Processing results with detection info
    """
    try:
        engine = get_engine()
        
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Process frame
        result = await engine.process_and_submit(camera_id, frame)
        
        return result
    
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-video")
async def process_video(
    camera_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Process video file from camera
    
    Request: Multipart form with camera_id and video file
    Response: Job started successfully
    """
    try:
        engine = get_engine()
        
        # Save video file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        # Process in background
        async def process_video_bg():
            try:
                processor = engine.create_processor(camera_id)
                result = processor.process_video_file(tmp_path)
                logger.info(f"Video processing completed for {camera_id}: {result}")
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        
        background_tasks.add_task(process_video_bg)
        
        return {
            "success": True,
            "message": "Video processing started",
            "camera_id": camera_id
        }
    
    except Exception as e:
        logger.error(f"Error starting video processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cameras/{camera_id}/stats")
async def get_camera_stats(camera_id: str):
    """Get processing statistics for specific camera"""
    try:
        engine = get_engine()
        stats = engine.get_processor_stats(camera_id)
        
        if not stats:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        return {"success": True, "stats": stats}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting camera stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_all_stats():
    """Get statistics for all active cameras"""
    try:
        engine = get_engine()
        stats = engine.get_all_stats()
        
        return {
            "success": True,
            "total_cameras": len(stats),
            "cameras": stats
        }
    
    except Exception as e:
        logger.error(f"Error getting all stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stream")
async def process_stream(
    camera_id: str,
    stream_url: str,
    duration_seconds: int = Query(None, ge=1)
):
    """
    Process video stream from camera
    
    Query Parameters:
    - camera_id: Camera identifier
    - stream_url: URL or file path of stream
    - duration_seconds: Optional duration limit in seconds
    
    Response: Stream processing started
    """
    try:
        engine = get_engine()
        
        # Start stream processing in background
        async def process_stream_bg():
            try:
                result = await engine.process_video_stream(
                    camera_id,
                    stream_url,
                    duration_seconds
                )
                logger.info(f"Stream processing result: {result}")
            except Exception as e:
                logger.error(f"Stream processing failed: {str(e)}")
        
        # Create task without waiting
        asyncio.create_task(process_stream_bg())
        
        return {
            "success": True,
            "message": "Stream processing started",
            "camera_id": camera_id
        }
    
    except Exception as e:
        logger.error(f"Error starting stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/init-camera")
async def init_camera(
    camera_id: str,
    capacity: int = Query(100, ge=1)
):
    """
    Initialize camera processor
    
    Query Parameters:
    - camera_id: Camera identifier
    - capacity: Maximum safe capacity for the area
    
    Response: Camera initialized successfully
    """
    try:
        engine = get_engine()
        processor = engine.create_processor(camera_id, capacity)
        
        return {
            "success": True,
            "message": f"Camera {camera_id} initialized",
            "stats": processor.get_stats()
        }
    
    except Exception as e:
        logger.error(f"Error initializing camera: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-info")
async def get_model_info():
    """Get information about loaded AI models"""
    try:
        engine = get_engine()
        processor = engine.create_processor("temp_info")
        
        model_info = processor.yolo_detector.get_model_info()
        
        return {
            "success": True,
            "yolo_model": model_info
        }
    
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
