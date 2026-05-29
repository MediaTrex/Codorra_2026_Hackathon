"""
Utility functions for AI Engine
"""

import numpy as np
from typing import List, Dict, Tuple
import cv2

def get_frame_info(frame):
    """Get information about a frame"""
    if frame is None:
        return None
    
    return {
        'height': frame.shape[0],
        'width': frame.shape[1],
        'channels': frame.shape[2] if len(frame.shape) > 2 else 1,
        'dtype': str(frame.dtype)
    }

def resize_frame(frame, width: int = None, height: int = None):
    """Resize frame maintaining aspect ratio"""
    if frame is None:
        return None
    
    h, w = frame.shape[:2]
    
    if width is None and height is None:
        return frame
    
    if width is None:
        ratio = height / h
        width = int(w * ratio)
    elif height is None:
        ratio = width / w
        height = int(h * ratio)
    
    return cv2.resize(frame, (width, height))

def calculate_iou(box1: List, box2: List):
    """Calculate Intersection over Union (IoU) between two bounding boxes"""
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2
    
    # Calculate intersection
    inter_xmin = max(x1_min, x2_min)
    inter_ymin = max(y1_min, y2_min)
    inter_xmax = min(x1_max, x2_max)
    inter_ymax = min(y1_max, y2_max)
    
    if inter_xmin >= inter_xmax or inter_ymin >= inter_ymax:
        return 0.0
    
    inter_area = (inter_xmax - inter_xmin) * (inter_ymax - inter_ymin)
    
    # Calculate union
    box1_area = (x1_max - x1_min) * (y1_max - y1_min)
    box2_area = (x2_max - x2_min) * (y2_max - y2_min)
    union_area = box1_area + box2_area - inter_area
    
    return inter_area / union_area if union_area > 0 else 0.0

def get_bbox_center(bbox: List):
    """Get center point of bounding box"""
    x1, y1, x2, y2 = bbox
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    return (cx, cy)

def get_bbox_area(bbox: List):
    """Get area of bounding box"""
    x1, y1, x2, y2 = bbox
    return (x2 - x1) * (y2 - y1)

def nms(detections: List[Dict], iou_threshold: float = 0.5):
    """
    Non-Maximum Suppression to remove overlapping detections
    
    Args:
        detections: List of detection dicts with 'bbox' and 'confidence'
        iou_threshold: IoU threshold for suppression
        
    Returns:
        Filtered list of detections
    """
    if not detections:
        return []
    
    # Sort by confidence
    sorted_detections = sorted(detections, key=lambda x: x['confidence'], reverse=True)
    
    selected = []
    for i, det1 in enumerate(sorted_detections):
        keep = True
        for det2 in selected:
            iou = calculate_iou(det1['bbox'], det2['bbox'])
            if iou > iou_threshold:
                keep = False
                break
        
        if keep:
            selected.append(det1)
    
    return selected

def format_detection_for_display(detection: Dict):
    """Format detection dictionary for display/logging"""
    bbox = detection.get('bbox', [])
    conf = detection.get('confidence', 0)
    return f"Bbox: [{bbox[0]:.1f}, {bbox[1]:.1f}, {bbox[2]:.1f}, {bbox[3]:.1f}] Conf: {conf:.2f}"

def get_density_color(density_percentage: float):
    """Get BGR color for density visualization"""
    if density_percentage <= 30:
        return (0, 255, 0)  # Green - Low
    elif density_percentage <= 60:
        return (0, 255, 255)  # Yellow - Medium
    elif density_percentage <= 85:
        return (0, 165, 255)  # Orange - High
    else:
        return (0, 0, 255)  # Red - Critical
