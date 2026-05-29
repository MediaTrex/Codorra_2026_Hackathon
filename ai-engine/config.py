import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """AI Engine configuration settings"""
    
    # Backend API Configuration
    BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
    BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")
    
    # Video Processing
    FRAME_SKIP = int(os.getenv("FRAME_SKIP", "5"))
    FRAME_WIDTH = int(os.getenv("FRAME_WIDTH", "640"))
    FRAME_HEIGHT = int(os.getenv("FRAME_HEIGHT", "480"))
    
    # YOLO Configuration
    YOLO_MODEL = os.getenv("YOLO_MODEL", "yolov8m.pt")
    YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.5"))
    YOLO_IOU = float(os.getenv("YOLO_IOU", "0.45"))
    
    # Density Estimation
    DEFAULT_CAPACITY = int(os.getenv("DEFAULT_CAPACITY", "100"))
    DENSITY_LOW_THRESHOLD = float(os.getenv("DENSITY_LOW_THRESHOLD", "30"))
    DENSITY_MEDIUM_THRESHOLD = float(os.getenv("DENSITY_MEDIUM_THRESHOLD", "60"))
    DENSITY_HIGH_THRESHOLD = float(os.getenv("DENSITY_HIGH_THRESHOLD", "85"))
    
    # Face Blurring
    BLUR_KERNEL_SIZE = int(os.getenv("BLUR_KERNEL_SIZE", "31"))
    ENABLE_FACE_BLUR = os.getenv("ENABLE_FACE_BLUR", "true").lower() == "true"
    
    # Processing
    MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "ai_engine.log")

settings = Settings()
