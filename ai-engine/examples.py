"""
Example script showing how to use the AI Engine
"""

import asyncio
from ai_engine import get_engine
from logger import logger
import cv2

async def example_process_frame():
    """Example: Process a single frame"""
    logger.info("=== Example: Process Single Frame ===")
    
    engine = get_engine()
    
    # Create processor
    processor = engine.create_processor("example_camera_001", capacity=100)
    
    # Load sample frame (using a blank frame for demo)
    frame = cv2.imread("sample_image.jpg")
    if frame is None:
        logger.error("Sample image not found. Skipping example.")
        return
    
    # Process frame
    result = await engine.process_and_submit("example_camera_001", frame)
    
    logger.info(f"Processing result: {result}")

def example_process_video():
    """Example: Process video file"""
    logger.info("=== Example: Process Video File ===")
    
    engine = get_engine()
    
    processor = engine.create_processor("example_camera_002", capacity=200)
    
    # Process video
    stats = processor.process_video_file(
        "sample_video.mp4",
        output_path="output_video.mp4"
    )
    
    if stats:
        logger.info(f"Video stats: {stats}")
        logger.info(f"Total alerts: {stats.get('total_alerts')}")
        logger.info(f"Avg density: {stats.get('avg_density')}%")

async def example_stream_processing():
    """Example: Process continuous stream"""
    logger.info("=== Example: Process Stream ===")
    
    engine = get_engine()
    
    # Process stream for 30 seconds
    result = await engine.process_video_stream(
        "example_camera_003",
        "sample_video.mp4",  # Or use "rtsp://..." for real streams
        duration_seconds=30
    )
    
    if result.get('success'):
        logger.info(f"Stream processing completed")
        logger.info(f"Total frames: {result.get('total_frames')}")
        logger.info(f"Total alerts: {result.get('total_alerts')}")

async def run_all_examples():
    """Run all examples"""
    logger.info("Starting AI Engine Examples")
    
    try:
        await example_process_frame()
    except Exception as e:
        logger.error(f"Frame example failed: {e}")
    
    try:
        example_process_video()
    except Exception as e:
        logger.error(f"Video example failed: {e}")
    
    try:
        await example_stream_processing()
    except Exception as e:
        logger.error(f"Stream example failed: {e}")
    
    logger.info("Examples completed")

if __name__ == "__main__":
    asyncio.run(run_all_examples())
