"""
AI Engine - Privacy-Preserving Crowd Density Estimator

Main entry point for AI processing pipeline that:
1. Detects people using YOLOv8
2. Counts crowd density
3. Blurs faces for privacy
4. Generates overcrowding alerts
5. Communicates with FastAPI backend
"""

from video_processor import VideoProcessor
from backend_client import BackendAPIClient
from logger import logger
import asyncio
from typing import Optional
import cv2

class AIEngine:
    """Main AI Engine orchestrator"""
    
    def __init__(self):
        """Initialize AI Engine"""
        self.processors = {}
        self.backend_client = BackendAPIClient()
        logger.info("AI Engine initialized")
    
    def create_processor(self, camera_id: str, capacity: Optional[int] = None):
        """
        Create video processor for a camera
        
        Args:
            camera_id: Unique camera identifier
            capacity: Maximum safe capacity
            
        Returns:
            VideoProcessor instance
        """
        if camera_id not in self.processors:
            self.processors[camera_id] = VideoProcessor(camera_id, capacity)
            logger.info(f"Created processor for camera: {camera_id}")
        
        return self.processors[camera_id]
    
    def process_frame(self, camera_id: str, frame):
        """
        Process frame from camera
        
        Args:
            camera_id: Camera identifier
            frame: Image frame (numpy array)
            
        Returns:
            Processing result dictionary
        """
        processor = self.create_processor(camera_id)
        return processor.process_frame(frame)
    
    async def process_and_submit(self, camera_id: str, frame):
        """
        Process frame and submit results to backend
        
        Args:
            camera_id: Camera identifier
            frame: Image frame
            
        Returns:
            Dictionary with processing and submission results
        """
        try:
            # Process frame
            result = self.process_frame(camera_id, frame)
            
            if result.get('skipped'):
                return {'success': False, 'message': 'Frame skipped'}
            
            density_info = result.get('density_info', {})
            
            # Prepare detection data
            detection_data = {
                'camera_id': camera_id,
                'people_count': density_info.get('people_count', 0),
                'density_percentage': density_info.get('density_percentage', 0),
                'density_level': density_info.get('density_level', 'low'),
                'risk_score': density_info.get('risk_score', 0)
            }
            
            # Submit detection to backend
            submission_result = await self.backend_client.submit_detection(detection_data)
            
            if not submission_result.get('success'):
                logger.error(f"Failed to submit detection: {submission_result.get('error')}")
                return {'success': False, 'message': submission_result.get('error')}
            
            # Submit alert if generated
            alert = result.get('alert')
            if alert:
                alert_result = await self.backend_client.submit_alert(alert)
                if not alert_result.get('success'):
                    logger.error(f"Failed to submit alert: {alert_result.get('error')}")
            
            return {
                'success': True,
                'density_info': density_info,
                'alert_generated': alert is not None
            }
        
        except Exception as e:
            logger.error(f"Error in process_and_submit: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    async def process_video_stream(self, camera_id: str, stream_url: str, duration_seconds: Optional[int] = None):
        """
        Process continuous video stream from camera
        
        Args:
            camera_id: Camera identifier
            stream_url: URL or file path of video stream
            duration_seconds: Optional duration to process (None for infinite)
            
        Returns:
            Statistics of stream processing
        """
        try:
            cap = cv2.VideoCapture(stream_url)
            
            if not cap.isOpened():
                logger.error(f"Cannot open stream: {stream_url}")
                return {'success': False, 'message': 'Cannot open stream'}
            
            fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
            frame_delay = 1 / fps
            
            processor = self.create_processor(camera_id)
            
            frame_count = 0
            alert_count = 0
            start_time = asyncio.get_event_loop().time()
            
            logger.info(f"Starting stream processing for camera {camera_id}")
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    logger.info(f"Stream ended for camera {camera_id}")
                    break
                
                frame_count += 1
                
                # Process frame
                result = self.process_frame(camera_id, frame)
                
                if not result.get('skipped'):
                    density_info = result.get('density_info', {})
                    
                    # Prepare detection data
                    detection_data = {
                        'camera_id': camera_id,
                        'people_count': density_info.get('people_count', 0),
                        'density_percentage': density_info.get('density_percentage', 0),
                        'density_level': density_info.get('density_level', 'low'),
                        'risk_score': density_info.get('risk_score', 0)
                    }
                    
                    # Submit to backend (non-blocking)
                    await self.backend_client.submit_detection(detection_data)
                    
                    # Submit alert if generated
                    alert = result.get('alert')
                    if alert:
                        await self.backend_client.submit_alert(alert)
                        alert_count += 1
                
                # Check duration limit
                if duration_seconds:
                    elapsed = asyncio.get_event_loop().time() - start_time
                    if elapsed > duration_seconds:
                        break
                
                await asyncio.sleep(frame_delay)
            
            cap.release()
            
            return {
                'success': True,
                'camera_id': camera_id,
                'total_frames': frame_count,
                'total_alerts': alert_count,
                'duration_seconds': asyncio.get_event_loop().time() - start_time
            }
        
        except Exception as e:
            logger.error(f"Error in stream processing: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def get_processor_stats(self, camera_id: str):
        """Get statistics for a specific camera processor"""
        if camera_id in self.processors:
            return self.processors[camera_id].get_stats()
        return None
    
    def get_all_stats(self):
        """Get statistics for all active processors"""
        return {
            camera_id: processor.get_stats()
            for camera_id, processor in self.processors.items()
        }


# Global AI Engine instance
_engine = None

def get_engine():
    """Get or create global AI Engine instance"""
    global _engine
    if _engine is None:
        _engine = AIEngine()
    return _engine


if __name__ == "__main__":
    # Example usage
    logger.info("Starting AI Engine example")
    
    engine = get_engine()
    
    # Example: Process video file
    processor = engine.create_processor("camera_001", capacity=100)
    result = processor.process_video_file("sample_video.mp4", "output_video.mp4")
    print("Video processing result:", result)
