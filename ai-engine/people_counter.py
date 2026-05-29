from logger import logger
from config import settings
import numpy as np

class PeopleCounter:
    """People counting module with centroid tracking"""
    
    def __init__(self):
        """Initialize people counter"""
        self.max_disappeared = 40
        self.centroids = {}
        self.next_object_id = 0
        logger.info("PeopleCounter module initialized")
    
    def count_detections(self, detections):
        """
        Count unique persons from detection results
        
        Args:
            detections: List of detection dictionaries with bounding boxes
            
        Returns:
            Number of unique persons detected
        """
        try:
            if not detections:
                return 0
            
            # Calculate centroids from bounding boxes
            centroids = []
            for detection in detections:
                bbox = detection['bbox']
                x1, y1, x2, y2 = bbox
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                centroids.append((cx, cy))
            
            # Simple counting: return number of detections
            count = len(centroids)
            logger.debug(f"Counted {count} persons in frame")
            return count
        
        except Exception as e:
            logger.error(f"Error counting people: {str(e)}")
            return 0
    
    def track_persons(self, detections, frame_shape):
        """
        Track persons across frames using centroid tracking
        
        Args:
            detections: List of detection dictionaries
            frame_shape: Shape of the frame (height, width)
            
        Returns:
            Dictionary mapping object IDs to centroids
        """
        try:
            input_centroids = []
            
            if len(detections) > 0:
                for detection in detections:
                    bbox = detection['bbox']
                    x1, y1, x2, y2 = bbox
                    cx = (x1 + x2) / 2
                    cy = (y1 + y2) / 2
                    input_centroids.append((cx, cy))
                
                input_centroids = np.array(input_centroids)
            else:
                input_centroids = np.empty((0, 2))
            
            # Update centroids
            if len(self.centroids) == 0:
                for i in range(0, len(input_centroids)):
                    self.centroids[self.next_object_id] = input_centroids[i]
                    self.next_object_id += 1
            else:
                object_ids = list(self.centroids.keys())
                object_centroids = np.array(list(self.centroids.values()))
                
                if len(input_centroids) > 0:
                    # Calculate distances
                    from scipy.spatial import distance as dist
                    distances = dist.cdist(object_centroids, input_centroids)
                    
                    rows = distances.min(axis=1).argsort()
                    cols = distances.argmin(axis=1)[rows]
                    
                    used_rows = set()
                    used_cols = set()
                    
                    for (row, col) in zip(rows, cols):
                        if row in used_rows or col in used_cols:
                            continue
                        if distances[row, col] > 50:
                            continue
                        
                        object_id = object_ids[row]
                        self.centroids[object_id] = input_centroids[col]
                        used_rows.add(row)
                        used_cols.add(col)
                    
                    # Add new detections
                    unused_rows = set(range(0, distances.shape[0])).difference(used_rows)
                    unused_cols = set(range(0, distances.shape[1])).difference(used_cols)
                    
                    if distances.shape[0] >= distances.shape[1]:
                        for row in unused_rows:
                            object_id = object_ids[row]
                            self.centroids.pop(object_id, None)
                    else:
                        for col in unused_cols:
                            self.centroids[self.next_object_id] = input_centroids[col]
                            self.next_object_id += 1
                else:
                    object_ids = list(self.centroids.keys())
                    for object_id in object_ids:
                        self.centroids.pop(object_id, None)
            
            return self.centroids
        
        except Exception as e:
            logger.error(f"Error tracking persons: {str(e)}")
            return self.centroids
    
    def get_count(self):
        """Get current count of tracked persons"""
        return len(self.centroids)
    
    def reset(self):
        """Reset tracker"""
        self.centroids = {}
        self.next_object_id = 0
        logger.info("PeopleCounter reset")
