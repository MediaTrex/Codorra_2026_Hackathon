"""
Quick Start Guide for AI Engine Integration
"""

# ==================== QUICK START GUIDE ====================

## Setup

1. Navigate to ai-engine folder:
   cd ai-engine

2. Install dependencies:
   pip install -r requirements.txt

3. Configure environment:
   cp .env.example .env
   # Edit .env with your backend URL and settings

## Running the AI Engine

### Option 1: As API Server (Recommended for production)
```bash
python api_server.py
```
- Server runs on http://localhost:8001
- All endpoints communicate with backend automatically

### Option 2: As Python Library
```python
from ai_engine import get_engine
engine = get_engine()
processor = engine.create_processor("camera_001", capacity=100)
result = processor.process_video_file("video.mp4")
```

## API Endpoints

### Process Single Frame
POST /api/process-frame?camera_id=camera_001
- Content-Type: multipart/form-data
- Upload image file
- Returns: Detection results with density info

### Process Video File
POST /api/process-video?camera_id=camera_001
- Content-Type: multipart/form-data
- Upload video file
- Returns: Processing job started

### Process Video Stream
POST /api/stream?camera_id=camera_001&stream_url=http://...
- Starts background stream processing
- Returns: Stream processing started

### Get Camera Stats
GET /api/cameras/camera_001/stats
- Returns: Statistics for specific camera

### Get All Stats
GET /api/stats
- Returns: Statistics for all active cameras

### Initialize Camera
POST /api/init-camera?camera_id=camera_001&capacity=100
- Initializes camera processor
- Returns: Camera initialized with stats

### Health Check
GET /health
- Returns: Service health status

## Key Features

✓ YOLOv8 Person Detection - Fast and accurate
✓ Privacy Preservation - Automatic face blurring
✓ Density Estimation - 4-level classification (Low/Medium/High/Critical)
✓ Alert Generation - Automatic overcrowding alerts
✓ Backend Integration - Seamless API communication
✓ Real-time Processing - 30+ FPS capable
✓ Stream Support - CCTV feeds, video files, RTSP streams

## Density Levels

- Low (0-30%): Green - Safe conditions
- Medium (31-60%): Yellow - Approaching capacity
- High (61-85%): Orange - High density alert
- Critical (86-100%): Red - Critical overcrowding

## Backend Integration

The AI Engine automatically:
1. Detects people using YOLOv8
2. Calculates crowd density
3. Blurs faces for privacy
4. Submits detections to: POST /api/detections
5. Submits alerts to: POST /api/alerts (when High/Critical)

## Environment Variables

Key configurations in .env:

- BACKEND_API_URL: Backend API base URL
- YOLO_MODEL: Model size (yolov8n/s/m/l/x)
- YOLO_CONFIDENCE: Detection confidence (0.5 default)
- DEFAULT_CAPACITY: Area capacity (100 default)
- ENABLE_FACE_BLUR: Privacy blurring (true/false)
- FRAME_SKIP: Process every Nth frame
- LOG_LEVEL: DEBUG/INFO/WARNING/ERROR

## Integration with Backend APIs

### Detection Submission Format
```json
{
    "camera_id": "507f1f77bcf86cd799439011",
    "people_count": 85,
    "density_percentage": 85.0,
    "density_level": "high",
    "risk_score": 0.85
}
```

### Alert Format
```json
{
    "camera_id": "507f1f77bcf86cd799439011",
    "type": "overcrowding",
    "severity": "high|critical",
    "people_count": 85,
    "density_percentage": 85.0,
    "status": "active",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### YOLO Model Download
- Models auto-download on first use (~400MB for yolov8m)
- Ensure internet connectivity
- Models cached in ~/.yolov8/

### Low Detection Accuracy
- Reduce YOLO_CONFIDENCE for more detections
- Check camera angle and lighting
- Use larger model (yolov8l instead of yolov8m)

### Slow Processing
- Increase FRAME_SKIP (process fewer frames)
- Reduce FRAME_WIDTH/HEIGHT
- Use GPU support (install cuda-enabled torch)

### Backend Connection Errors
- Verify BACKEND_API_URL is correct
- Check backend service is running
- Verify network connectivity
- Check firewall rules

## Development

### Running Tests
```bash
python test_modules.py
```

### Running Examples
```bash
python examples.py
```

### Adding Custom Processing
Extend VideoProcessor class in video_processor.py

## Performance Tips

- Use smaller YOLO models (yolov8n) for mobile
- Increase FRAME_SKIP for lower accuracy but faster processing
- Disable face blurring if not needed (ENABLE_FACE_BLUR=false)
- Use GPU acceleration for real-time 30+ FPS processing

## Support & Documentation

See README.md for comprehensive documentation
