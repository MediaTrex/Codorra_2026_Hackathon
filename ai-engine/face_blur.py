import cv2
import numpy as np
from logger import logger
from config import settings

class FaceBlur:
    """Privacy-preserving face blurring module"""
    
    def __init__(self):
        """Initialize face detection cascade classifier"""
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.kernel_size = settings.BLUR_KERNEL_SIZE
        logger.info("FaceBlur module initialized")
    
    def blur_faces(self, frame):
        """
        Detect and blur all faces in frame for privacy preservation
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            Blurred frame with privacy-preserved faces
        """
        if not settings.ENABLE_FACE_BLUR:
            return frame
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.3,
                minNeighbors=4,
                minSize=(30, 30)
            )
            
            blurred_frame = frame.copy()
            
            for (x, y, w, h) in faces:
                roi = blurred_frame[y:y+h, x:x+w]
                blurred_roi = cv2.blur(roi, (self.kernel_size, self.kernel_size))
                blurred_frame[y:y+h, x:x+w] = blurred_roi
            
            logger.debug(f"Blurred {len(faces)} faces in frame")
            return blurred_frame
        
        except Exception as e:
            logger.error(f"Error blurring faces: {str(e)}")
            return frame
    
    def anonymize_frame(self, frame):
        """Additional anonymization by reducing color information in face regions"""
        if not settings.ENABLE_FACE_BLUR:
            return frame
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 4)
            
            anonymized_frame = frame.copy()
            
            for (x, y, w, h) in faces:
                # Apply pixelation effect
                cell_size = 10
                for i in range(0, h, cell_size):
                    for j in range(0, w, cell_size):
                        roi = anonymized_frame[y+i:y+i+cell_size, x+j:x+j+cell_size]
                        color = roi.mean(axis=0).mean(axis=0).astype(int)
                        anonymized_frame[y+i:y+i+cell_size, x+j:x+j+cell_size] = color
            
            return anonymized_frame
        
        except Exception as e:
            logger.error(f"Error anonymizing frame: {str(e)}")
            return frame
