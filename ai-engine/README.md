# AI Engine - Privacy-Preserving Crowd Density Estimator

This is the AI/ML component of the CrowdShield AI system. It handles real-time crowd density estimation, person detection, privacy preservation, and alert generation.

## Core Features

- **YOLOv8 Person Detection**: Fast and accurate person detection using state-of-the-art deep learning
- **Crowd Density Estimation**: Calculates density levels (Low, Medium, High, Critical) based on area capacity
- **Privacy Preservation**: Automatically blurs faces in video feeds to protect individual privacy
- **Overcrowding Alerts**: Generates alerts when crowd density exceeds safe thresholds
- **Backend Integration**: Seamlessly communicates with FastAPI backend for data persistence and analytics

## Project Structure

```
ai-engine/
├── config.py              # Configuration and settings management
├── logger.py              # Logging setup
├── yolo_detector.py       # YOLOv8 person detection module
├── people_counter.py      # People counting with centroid tracking
├── density_estimator.py   # Density calculation and risk classification
├── face_blur.py           # Privacy-preserving face blurring
├── alert_generator.py     # Overcrowding alert generation
├── video_processor.py     # Main video processing pipeline
├── backend_client.py      # HTTP client for backend API communication
├── ai_engine.py           # Main AI Engine orchestrator
├── api_server.py          # FastAPI server for AI Engine APIs
├── requirements.txt       # Python dependencies
├── .env.example          # Example environment configuration
└── README.md             # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-engine
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Usage

### As a Python Library

```python
from ai_engine import get_engine
import cv2

# Get engine instance
engine = get_engine()

# Create processor for a camera
processor = engine.create_processor("camera_001", capacity=100)

# Process video file
stats = processor.process_video_file("input.mp4", "output.mp4")
print(stats)
```

### As an API Server

```bash
python api_server.py
```

Server runs on `http://localhost:8001`

#### API Endpoints

- `POST /api/process-frame` - Process single frame
- `POST /api/process-video` - Process video file
- `POST /api/stream` - Process video stream
- `POST /api/init-camera` - Initialize camera
- `GET /api/cameras/{camera_id}/stats` - Get camera statistics
- `GET /api/stats` - Get all camera statistics
- `GET /api/model-info` - Get model information
- `GET /health` - Health check

### Configuration

Key environment variables:

```env
# Backend API
BACKEND_API_URL=http://localhost:8000
BACKEND_API_KEY=your_api_key

# YOLO Model
YOLO_MODEL=yolov8m.pt
YOLO_CONFIDENCE=0.5

# Density Thresholds (%)
DENSITY_LOW_THRESHOLD=30
DENSITY_MEDIUM_THRESHOLD=60
DENSITY_HIGH_THRESHOLD=85

# Face Blurring
ENABLE_FACE_BLUR=true
BLUR_KERNEL_SIZE=31

# Processing
FRAME_SKIP=5
DEFAULT_CAPACITY=100
```

## AI Pipeline

```
Video/Frame Input
    ↓
YOLO Person Detection
    ↓
People Counting
    ↓
Density Estimation
    ↓
Risk Classification
    ↓
Face Blurring (Privacy)
    ↓
Alert Generation
    ↓
Backend API Submission
    ↓
Dashboard Analytics
```

## Density Classification

The system classifies crowd density into four levels:

| Density % | Level | Risk Score | Alert Triggered |
|-----------|-------|-----------|-----------------|
| 0-30% | Low | 0.0-0.3 | No |
| 31-60% | Medium | 0.3-0.6 | No |
| 61-85% | High | 0.6-0.85 | Yes |
| 86-100% | Critical | 0.85-1.0 | Yes |

## Privacy Features

- **Face Blurring**: Automatically detects and blurs faces using Haar Cascade classifiers
- **Anonymization**: All stored data contains only crowd counts and density metrics, never identities
- **No Facial Recognition**: System deliberately avoids biometric identification
- **Data Minimization**: Only essential metadata is stored and transmitted

## Performance

- **Real-time Processing**: Processes at 30+ FPS on modern hardware
- **Frame Skipping**: Configurable frame skipping for performance optimization
- **Async Communication**: Non-blocking backend API submissions
- **Efficient Tracking**: Centroid-based person tracking across frames

## Integration with Backend

The AI Engine communicates with the FastAPI backend through REST APIs:

1. **Detection Submission**: Sends density and count data after each processed frame
2. **Alert Submission**: Sends alerts when density exceeds safe thresholds
3. **Camera Info Retrieval**: Fetches camera capacity and metadata
4. **Stream Configuration**: Gets configuration for stream processing

## Error Handling

- Graceful degradation if backend is unavailable
- Comprehensive logging for debugging
- Timeout handling for network requests
- Invalid input validation

## Requirements

- Python 3.8+
- CUDA-capable GPU (recommended for real-time processing)
- OpenCV 4.8+
- PyTorch 2.0+
- YOLOv8 model files (auto-downloaded on first use)

## Troubleshooting

### YOLO Model Not Found
The model will auto-download on first use. Ensure you have internet connectivity.

### Low Detection Accuracy
- Adjust `YOLO_CONFIDENCE` threshold in `.env`
- Ensure adequate lighting in video feeds
- Check camera placement and angle

### Slow Processing
- Increase `FRAME_SKIP` to process fewer frames
- Reduce `FRAME_WIDTH` and `FRAME_HEIGHT`
- Use a smaller YOLO model (yolov8n instead of yolov8l)

### Backend Connection Issues
- Verify `BACKEND_API_URL` is correct
- Check backend service is running
- Verify network connectivity

## License

This project is part of the CrowdShield AI hackathon submission.

## Support

For issues, feature requests, or questions, contact the development team.
