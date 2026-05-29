from ultralytics import YOLO
import cv2
import numpy as np
from logger import logger
from config import settings

class YOLOv8Detector:
    """YOLOv8 person detection module using Ultralytics"""
    
    def __init__(self, model_name: str = None):
        """
        Initialize YOLOv8 detector
        
        Args:
            model_name: Name of YOLO model to use (e.g., 'yolov8m.pt')
        """
        try:
            self.model_name = model_name or settings.YOLO_MODEL
            self.model = YOLO(self.model_name)
            self.confidence = settings.YOLO_CONFIDENCE
            self.iou = settings.YOLO_IOU
            logger.info(f"YOLOv8 model '{self.model_name}' loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load YOLOv8 model: {str(e)}")
            raise
    
    def detect_persons(self, frame):
        """
        Detect all persons in frame using YOLOv8
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            List of detections with bounding boxes and confidence scores
        """
        try:
            # Run inference
            results = self.model(frame, conf=self.confidence, iou=self.iou, verbose=False)
            
            detections = []
            
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    # Check if detection is person class (class 0)
                    cls = int(box.cls[0])
                    if cls == 0:  # YOLO person class
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].cpu().numpy()
                        
                        detection = {
                            'bbox': xyxy.tolist(),  # [x1, y1, x2, y2]
                            'confidence': conf,
                            'class': cls
                        }
                        detections.append(detection)
            
            logger.debug(f"Detected {len(detections)} persons in frame")
            return detections
        
        except Exception as e:
            logger.error(f"Error during person detection: {str(e)}")
            return []
    
    def draw_detections(self, frame, detections):
        """
        Draw bounding boxes on frame for visualization
        
        Args:
            frame: Input frame
            detections: List of detections
            
        Returns:
            Frame with drawn bounding boxes
        """
        try:
            drawn_frame = frame.copy()
            
            for detection in detections:
                bbox = detection['bbox']
                conf = detection['confidence']
                
                x1, y1, x2, y2 = [int(x) for x in bbox]
                
                # Draw rectangle
                cv2.rectangle(drawn_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Draw confidence score
                label = f"Person: {conf:.2f}"
                cv2.putText(
                    drawn_frame,
                    label,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2
                )
            
            return drawn_frame
        
        except Exception as e:
            logger.error(f"Error drawing detections: {str(e)}")
            return frame
    
    def get_model_info(self):
        """Get information about loaded model"""
        return {
            'model_name': self.model_name,
            'confidence_threshold': self.confidence,
            'iou_threshold': self.iou,
            'task': self.model.task
        }
