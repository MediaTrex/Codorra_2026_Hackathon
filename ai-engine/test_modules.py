"""
Unit tests for AI Engine modules
"""

import unittest
import numpy as np
import cv2
from unittest.mock import Mock, patch, MagicMock
from logger import logger

class TestDensityEstimator(unittest.TestCase):
    """Test density estimation module"""
    
    def setUp(self):
        from density_estimator import DensityEstimator
        self.estimator = DensityEstimator(capacity=100)
    
    def test_calculate_density(self):
        """Test density calculation"""
        # 50 people in 100 capacity = 50%
        density = self.estimator.calculate_density(50)
        self.assertEqual(density, 50.0)
        
        # 100 people in 100 capacity = 100%
        density = self.estimator.calculate_density(100)
        self.assertEqual(density, 100.0)
        
        # 150 people in 100 capacity = capped at 100%
        density = self.estimator.calculate_density(150)
        self.assertEqual(density, 100.0)
    
    def test_classify_density_level(self):
        """Test density level classification"""
        level, risk = self.estimator.classify_density_level(15)
        self.assertEqual(level, "low")
        
        level, risk = self.estimator.classify_density_level(45)
        self.assertEqual(level, "medium")
        
        level, risk = self.estimator.classify_density_level(70)
        self.assertEqual(level, "high")
        
        level, risk = self.estimator.classify_density_level(90)
        self.assertEqual(level, "critical")
    
    def test_should_generate_alert(self):
        """Test alert generation logic"""
        self.assertFalse(self.estimator.should_generate_alert("low"))
        self.assertFalse(self.estimator.should_generate_alert("medium"))
        self.assertTrue(self.estimator.should_generate_alert("high"))
        self.assertTrue(self.estimator.should_generate_alert("critical"))

class TestPeopleCounter(unittest.TestCase):
    """Test people counting module"""
    
    def setUp(self):
        from people_counter import PeopleCounter
        self.counter = PeopleCounter()
    
    def test_count_detections_empty(self):
        """Test counting empty detections"""
        count = self.counter.count_detections([])
        self.assertEqual(count, 0)
    
    def test_count_detections(self):
        """Test counting detections"""
        detections = [
            {'bbox': [10, 10, 50, 50], 'confidence': 0.9},
            {'bbox': [60, 60, 100, 100], 'confidence': 0.85},
            {'bbox': [110, 110, 150, 150], 'confidence': 0.92}
        ]
        count = self.counter.count_detections(detections)
        self.assertEqual(count, 3)

class TestAlertGenerator(unittest.TestCase):
    """Test alert generation module"""
    
    def setUp(self):
        from alert_generator import AlertGenerator
        self.generator = AlertGenerator()
    
    def test_should_not_alert_on_low_density(self):
        """Test no alert for low density"""
        density_info = {
            'people_count': 20,
            'density_percentage': 20,
            'density_level': 'low',
            'risk_score': 0.2
        }
        alert = self.generator.generate_alert("camera_001", density_info)
        self.assertIsNone(alert)
    
    def test_should_alert_on_high_density(self):
        """Test alert generation for high density"""
        density_info = {
            'people_count': 75,
            'density_percentage': 75,
            'density_level': 'high',
            'risk_score': 0.75
        }
        alert = self.generator.generate_alert("camera_001", density_info)
        self.assertIsNotNone(alert)
        self.assertEqual(alert['severity'], 'high')
        self.assertEqual(alert['camera_id'], 'camera_001')
    
    def test_alert_cooldown(self):
        """Test alert cooldown mechanism"""
        self.generator.set_cooldown(2)  # 2 seconds
        
        density_info = {
            'people_count': 90,
            'density_percentage': 90,
            'density_level': 'critical',
            'risk_score': 0.9
        }
        
        # First alert should be generated
        alert1 = self.generator.generate_alert("camera_001", density_info)
        self.assertIsNotNone(alert1)
        
        # Second alert immediately should be blocked by cooldown
        alert2 = self.generator.generate_alert("camera_001", density_info)
        self.assertIsNone(alert2)

class TestUtils(unittest.TestCase):
    """Test utility functions"""
    
    def test_calculate_iou(self):
        """Test IoU calculation"""
        from utils import calculate_iou
        
        # Identical boxes
        iou = calculate_iou([0, 0, 10, 10], [0, 0, 10, 10])
        self.assertAlmostEqual(iou, 1.0)
        
        # No overlap
        iou = calculate_iou([0, 0, 10, 10], [20, 20, 30, 30])
        self.assertEqual(iou, 0.0)
        
        # 50% overlap
        iou = calculate_iou([0, 0, 10, 10], [5, 5, 15, 15])
        self.assertAlmostEqual(iou, 0.14285714, places=5)
    
    def test_get_bbox_center(self):
        """Test center calculation"""
        from utils import get_bbox_center
        
        center = get_bbox_center([0, 0, 10, 10])
        self.assertEqual(center, (5.0, 5.0))
        
        center = get_bbox_center([10, 10, 30, 40])
        self.assertEqual(center, (20.0, 25.0))
    
    def test_get_bbox_area(self):
        """Test area calculation"""
        from utils import get_bbox_area
        
        area = get_bbox_area([0, 0, 10, 10])
        self.assertEqual(area, 100)
        
        area = get_bbox_area([0, 0, 20, 30])
        self.assertEqual(area, 600)

class TestBackendClient(unittest.TestCase):
    """Test backend API client"""
    
    def setUp(self):
        from backend_client import BackendAPIClient
        self.client = BackendAPIClient(base_url="http://localhost:8000")
    
    @patch('aiohttp.ClientSession')
    async def test_submit_detection_success(self, mock_session):
        """Test successful detection submission"""
        # This is a simplified test
        detection_data = {
            'camera_id': 'camera_001',
            'people_count': 50,
            'density_percentage': 50,
            'density_level': 'medium',
            'risk_score': 0.5
        }
        
        # In real test, would mock the async response
        logger.info("Backend client test placeholder")

def run_tests():
    """Run all tests"""
    unittest.main(argv=[''], exit=False, verbosity=2)

if __name__ == "__main__":
    run_tests()
