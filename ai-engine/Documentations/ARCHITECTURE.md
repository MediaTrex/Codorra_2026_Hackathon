## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Dashboard                       │
│                      (ReactJS)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│              (REST API + WebSocket)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes: Detection, Alerts, Analytics, Cameras       │   │
│  │ Services: Database, WebSocket, Business Logic       │   │
│  │ Models: User, Camera, Alert, Density Logs           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │    AI Engine API Server            │
         │  (api_server.py)                   │
         │  Endpoints: /api/process-*         │
         └───────────────┬───────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Processing Pipeline                     │
│                                                              │
│  ┌─────────────┐     ┌──────────────┐     ┌────────────┐   │
│  │ Video Input │────▶│ Frame Extract│────▶│ Resize &   │   │
│  │             │     │              │     │ Normalize  │   │
│  └─────────────┘     └──────────────┘     └──────┬─────┘   │
│                                                    │        │
│                                                    ▼        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              YOLOv8 Person Detection                │  │
│  │           (yolo_detector.py)                        │  │
│  │  - Detect persons in frame                          │  │
│  │  - Filter non-person objects                        │  │
│  │  - Return bounding boxes + confidence               │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                │                                            │
│                ▼                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              People Counting                         │  │
│  │         (people_counter.py)                          │  │
│  │  - Count detections                                  │  │
│  │  - Track persons across frames                       │  │
│  │  - Remove duplicates                                 │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                │                                            │
│                ▼                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Density Estimation                      │  │
│  │        (density_estimator.py)                        │  │
│  │  - Calculate density percentage                      │  │
│  │  - Classify risk level                               │  │
│  │  - Generate risk score                               │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                │                                            │
│    ┌───────────┴───────────┐                               │
│    │                       │                               │
│    ▼                       ▼                               │
│ ┌──────────┐         ┌──────────────────────────────────┐ │
│ │Face Blur │         │      Alert Generator             │ │
│ │(face_    │         │   (alert_generator.py)           │ │
│ │blur.py)  │         │  - Check if alert needed         │ │
│ │          │         │  - Apply cooldown                │ │
│ │ Privacy  │         │  - Generate alert object         │ │
│ │Preserv.  │         └──────────────┬───────────────────┘ │
│ └──────────┘                        │                      │
│                                     ▼                      │
│            ┌──────────────────────────────────────────┐   │
│            │     Backend API Client                   │   │
│            │    (backend_client.py)                   │   │
│            │  - Submit detection data                 │   │
│            │  - Submit alerts                         │   │
│            │  - Get camera config                     │   │
│            │  - Health checks                         │   │
│            └──────────────┬───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │      MongoDB Database             │
         │                                   │
         │  Collections:                     │
         │  - density_logs                   │
         │  - alerts                         │
         │  - cameras                        │
         │  - users                          │
         └───────────────────────────────────┘
```

## Module Relationships

### Core Processing Modules

1. **yolo_detector.py** - YOLOv8 Person Detection
   - Input: Video frame
   - Output: List of person detections with bounding boxes
   - Used by: video_processor.py
   - Dependencies: ultralytics, cv2, numpy

2. **people_counter.py** - People Counting & Tracking
   - Input: Detection list
   - Output: Total people count, tracked centroids
   - Used by: video_processor.py
   - Implements: Centroid tracking algorithm

3. **density_estimator.py** - Density Calculation
   - Input: People count
   - Output: Density percentage, risk level, risk score
   - Used by: video_processor.py
   - Thresholds: Low(0-30), Medium(31-60), High(61-85), Critical(86-100)

4. **face_blur.py** - Privacy Preservation
   - Input: Video frame
   - Output: Blurred frame with anonymized faces
   - Used by: video_processor.py
   - Implements: Haar Cascade face detection

5. **alert_generator.py** - Alert Generation
   - Input: Density estimation results
   - Output: Alert object or None
   - Used by: video_processor.py
   - Features: Cooldown mechanism, alert history

### Integration Modules

6. **video_processor.py** - Main Processing Pipeline
   - Orchestrates: yolo_detector → people_counter → density_estimator → face_blur → alert_generator
   - Input: Video frame or video file
   - Output: Processing results with all metrics
   - Used by: ai_engine.py, api_server.py

7. **backend_client.py** - Backend Communication
   - Methods: submit_detection(), submit_alert(), get_camera_info()
   - Used by: ai_engine.py, video_processor.py
   - Protocol: Async HTTP with aiohttp

8. **ai_engine.py** - Main Orchestrator
   - Creates: Video processors per camera
   - Coordinates: Frame processing and backend submission
   - Used by: api_server.py, scripts
   - Implements: Singleton pattern for engine instance

### API & Server

9. **api_server.py** - FastAPI HTTP Server
   - Port: 8001
   - Endpoints: /api/process-frame, /api/process-video, /api/stream, etc.
   - Used by: Frontend, external clients
   - Depends on: ai_engine.py

### Utilities & Config

10. **config.py** - Configuration Management
    - Loads: Environment variables
    - Provides: Settings object for all modules
    - Used by: All modules

11. **logger.py** - Logging System
    - Provides: Configured logger instance
    - Output: Console + File
    - Used by: All modules

12. **utils.py** - Utility Functions
    - Functions: IoU calculation, NMS, frame operations, color mapping
    - Used by: All modules as needed

## Data Flow

### Single Frame Processing
```
Frame Input
    │
    ├─→ YOLO Detection (detections)
    │
    ├─→ People Count (count)
    │
    ├─→ Density Estimation (density_info)
    │
    ├─→ Alert Check (alert or None)
    │
    ├─→ Face Blurring (processed_frame)
    │
    └─→ Submit to Backend (if connected)
```

### Video File Processing
```
Video File
    │
    ├─→ Open with OpenCV
    │
    ├─→ For each frame:
    │   └─→ Single Frame Processing (above)
    │       └─→ Accumulate statistics
    │
    └─→ Return video statistics
```

### Stream Processing
```
Video Stream (CCTV/RTSP)
    │
    ├─→ Open stream connection
    │
    ├─→ Continuous processing:
    │   ├─→ Read frame
    │   ├─→ Single Frame Processing
    │   ├─→ Submit to Backend (async)
    │   └─→ Wait frame_delay
    │
    └─→ Until: duration_limit or disconnect
```

## Communication Protocols

### Detection Submission (AI Engine → Backend)
```
POST /api/detections
{
    "camera_id": "507f1f77bcf86cd799439011",
    "people_count": 85,
    "density_percentage": 85.0,
    "density_level": "high",
    "risk_score": 0.85
}
```

### Alert Submission (AI Engine → Backend)
```
POST /api/alerts
{
    "camera_id": "507f1f77bcf86cd799439011",
    "type": "overcrowding",
    "severity": "high|critical",
    "people_count": 85,
    "density_percentage": 85.0,
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Health Check (Backend → AI Engine)
```
GET /health
{
    "status": "healthy",
    "service": "ai-engine"
}
```

## Performance Characteristics

### Per-Frame Processing
- YOLO Detection: ~30-50ms (GPU), ~200-300ms (CPU)
- People Counting: ~1-2ms
- Density Estimation: <1ms
- Face Blurring: ~50-100ms
- Total: ~80-150ms per frame (with GPU)

### Frame Skip Optimization
- Default: Process every 5th frame
- Benefit: 5x speedup with minimal accuracy loss
- Result: Can process 150+ FPS

### Memory Usage
- YOLOv8m model: ~400MB
- Per-processor: ~100-200MB
- Multi-camera: Linear with number of cameras

## Extensibility Points

1. **Custom Detection Models**: Swap YOLOv8 for other detectors
2. **Additional Anonymization**: Add more privacy techniques
3. **Advanced Tracking**: Implement Kalman filter tracking
4. **Custom Alerts**: Add domain-specific alert rules
5. **Analytics**: Integrate historical analysis
6. **Visualization**: Add real-time visualization tools

## Deployment Considerations

- **Stateless Design**: Each processor is independent
- **Horizontal Scaling**: Deploy multiple instances
- **Load Balancing**: Frontend distributes camera streams
- **GPU Requirements**: Recommended for real-time processing
- **Storage**: Stream logs to backend database
