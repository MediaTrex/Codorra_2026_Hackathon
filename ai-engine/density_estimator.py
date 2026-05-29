from logger import logger
from config import settings
import numpy as np

class DensityEstimator:
    """Crowd density estimation and risk level classification"""
    
    def __init__(self, capacity: int = None):
        """
        Initialize density estimator
        
        Args:
            capacity: Maximum safe capacity for the area
        """
        self.capacity = capacity or settings.DEFAULT_CAPACITY
        self.low_threshold = settings.DENSITY_LOW_THRESHOLD
        self.medium_threshold = settings.DENSITY_MEDIUM_THRESHOLD
        self.high_threshold = settings.DENSITY_HIGH_THRESHOLD
        logger.info(f"DensityEstimator initialized with capacity: {self.capacity}")
    
    def calculate_density(self, people_count: int):
        """
        Calculate density percentage
        
        Formula: (Number of People / Area Capacity) × 100
        
        Args:
            people_count: Number of detected persons
            
        Returns:
            Density percentage (0-100+)
        """
        try:
            if self.capacity <= 0:
                return 0.0
            
            density_percentage = (people_count / self.capacity) * 100
            return min(density_percentage, 100.0)  # Cap at 100%
        
        except Exception as e:
            logger.error(f"Error calculating density: {str(e)}")
            return 0.0
    
    def classify_density_level(self, density_percentage: float):
        """
        Classify crowd density into risk levels
        
        Density Levels:
        - Low: 0-30%
        - Medium: 31-60%
        - High: 61-85%
        - Critical: 86-100%
        
        Args:
            density_percentage: Density percentage value
            
        Returns:
            Tuple of (density_level, risk_score)
        """
        try:
            if density_percentage <= self.low_threshold:
                return "low", density_percentage / 100.0
            elif density_percentage <= self.medium_threshold:
                return "medium", density_percentage / 100.0
            elif density_percentage <= self.high_threshold:
                return "high", density_percentage / 100.0
            else:
                return "critical", min(density_percentage / 100.0, 1.0)
        
        except Exception as e:
            logger.error(f"Error classifying density: {str(e)}")
            return "unknown", 0.0
    
    def estimate(self, people_count: int):
        """
        Estimate density and risk level in one call
        
        Args:
            people_count: Number of detected persons
            
        Returns:
            Dictionary with density_percentage, level, and risk_score
        """
        try:
            density_percentage = self.calculate_density(people_count)
            density_level, risk_score = self.classify_density_level(density_percentage)
            
            result = {
                'people_count': people_count,
                'density_percentage': round(density_percentage, 2),
                'density_level': density_level,
                'risk_score': round(risk_score, 3),
                'capacity': self.capacity
            }
            
            logger.debug(f"Density estimation: {result}")
            return result
        
        except Exception as e:
            logger.error(f"Error estimating density: {str(e)}")
            return {
                'people_count': 0,
                'density_percentage': 0.0,
                'density_level': 'unknown',
                'risk_score': 0.0,
                'capacity': self.capacity
            }
    
    def get_alert_level(self, density_level: str):
        """
        Get alert level based on density level
        
        Args:
            density_level: Density level string
            
        Returns:
            Alert level: 'low', 'medium', 'high', or 'critical'
        """
        return density_level
    
    def should_generate_alert(self, density_level: str):
        """
        Determine if an alert should be generated
        
        Args:
            density_level: Density level string
            
        Returns:
            Boolean indicating if alert should be generated
        """
        return density_level in ['high', 'critical']
    
    def set_capacity(self, capacity: int):
        """Update capacity for estimation"""
        if capacity > 0:
            self.capacity = capacity
            logger.info(f"Capacity updated to: {capacity}")
