import cv2
import numpy as np
from logger import logger
from config import settings
from yolo_detector import YOLOv8Detector
from people_counter import PeopleCounter
from density_estimator import DensityEstimator
from face_blur import FaceBlur
from alert_generator import AlertGenerator

class VideoProcessor:
    """Main video processing pipeline for crowd density estimation"""
    
    def __init__(self, camera_id: str, capacity: int = None):
        """
        Initialize video processor
        
        Args:
            camera_id: Unique identifier for the camera
            capacity: Maximum safe capacity for the area
        """
        self.camera_id = camera_id
        self.capacity = capacity or settings.DEFAULT_CAPACITY
        
        # Initialize modules
        self.yolo_detector = YOLOv8Detector()
        self.people_counter = PeopleCounter()
        self.density_estimator = DensityEstimator(self.capacity)
        self.face_blur = FaceBlur()
        self.alert_generator = AlertGenerator()
        
        self.frame_count = 0
        self.last_detections = []
        self.last_density_info = {}
        
        logger.info(f"VideoProcessor initialized for camera: {camera_id}")
    
    def process_frame(self, frame):
        """
        Process single frame through full pipeline
        
        Args:
            frame: Input image frame
            
        Returns:
            Dictionary containing:
            - processed_frame: Frame with privacy preservation
            - detections: Raw YOLO detections
            - people_count: Number of detected persons
            - density_info: Density estimation results
            - alert: Generated alert or None
        """
        try:
            self.frame_count += 1
            
            # Only process every Nth frame for performance
            if self.frame_count % settings.FRAME_SKIP != 0:
                return {
                    'frame_count': self.frame_count,
                    'skipped': True,
                    'people_count': self.last_density_info.get('people_count', 0),
                    'density_info': self.last_density_info
                }
            
            # Step 1: Detect persons using YOLOv8
            detections = self.yolo_detector.detect_persons(frame)
            
            # Step 2: Count people
            people_count = self.people_counter.count_detections(detections)
            
            # Step 3: Estimate density
            density_info = self.density_estimator.estimate(people_count)
            
            # Step 4: Generate alert if needed
            alert = self.alert_generator.generate_alert(self.camera_id, density_info)
            
            # Step 5: Blur faces for privacy
            processed_frame = self.face_blur.blur_faces(frame)
            
            # Store for later reference
            self.last_detections = detections
            self.last_density_info = density_info
            
            result = {
                'camera_id': self.camera_id,
                'frame_count': self.frame_count,
                'skipped': False,
                'detections': detections,
                'people_count': people_count,
                'density_info': density_info,
                'alert': alert,
                'processed_frame': processed_frame
            }
            
            logger.info(f"Frame {self.frame_count}: {people_count} people, {density_info['density_level']} density")
            return result
        
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            return {
                'camera_id': self.camera_id,
                'frame_count': self.frame_count,
                'error': str(e),
                'people_count': 0,
                'density_info': {}
            }
    
    def process_video_file(self, video_path, output_path=None):
        """
        Process entire video file
        
        Args:
            video_path: Path to input video file
            output_path: Optional path to save output video
            
        Returns:
            Statistics about the video processing
        """
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                logger.error(f"Cannot open video: {video_path}")
                return None
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            logger.info(f"Processing video: {total_frames} frames at {fps} FPS")
            
            # Setup output writer if requested
            out = None
            if output_path:
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # Process frames
            all_detections = []
            all_density_info = []
            all_alerts = []
            frame_num = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                result = self.process_frame(frame)
                frame_num += 1
                
                if not result.get('skipped'):
                    all_detections.append(result.get('detections', []))
                    all_density_info.append(result.get('density_info', {}))
                    
                    if result.get('alert'):
                        all_alerts.append(result['alert'])
                    
                    if out and 'processed_frame' in result:
                        out.write(result['processed_frame'])
            
            cap.release()
            if out:
                out.release()
            
            stats = {
                'video_path': video_path,
                'total_frames': total_frames,
                'processed_frames': frame_num,
                'fps': fps,
                'duration_seconds': total_frames / fps,
                'total_detections': len(all_detections),
                'total_alerts': len(all_alerts),
                'alerts': all_alerts
            }
            
            if all_density_info:
                density_values = [d.get('density_percentage', 0) for d in all_density_info]
                stats['avg_density'] = round(np.mean(density_values), 2)
                stats['max_density'] = round(np.max(density_values), 2)
                stats['min_density'] = round(np.min(density_values), 2)
            
            logger.info(f"Video processing complete: {stats}")
            return stats
        
        except Exception as e:
            logger.error(f"Error processing video file: {str(e)}")
            return None
    
    def get_stats(self):
        """Get current processing statistics"""
        return {
            'camera_id': self.camera_id,
            'total_frames_processed': self.frame_count,
            'last_people_count': self.last_density_info.get('people_count', 0),
            'last_density_level': self.last_density_info.get('density_level', 'unknown'),
            'last_density_percentage': self.last_density_info.get('density_percentage', 0),
            'capacity': self.capacity
        }
    
    def reset(self):
        """Reset processor state"""
        self.frame_count = 0
        self.last_detections = []
        self.last_density_info = {}
        self.people_counter.reset()
        self.alert_generator.clear_cooldown()
        logger.info(f"VideoProcessor reset for camera: {self.camera_id}")
