from logger import logger
from config import settings
from datetime import datetime

class AlertGenerator:
    """Generate alerts for overcrowding conditions"""
    
    def __init__(self):
        """Initialize alert generator"""
        self.alert_history = {}
        self.alert_cooldown = 60  # seconds
        logger.info("AlertGenerator module initialized")
    
    def generate_alert(self, camera_id: str, density_info: dict):
        """
        Generate alert if conditions warrant it
        
        Args:
            camera_id: ID of the camera
            density_info: Dictionary containing density estimation results
                - people_count: int
                - density_percentage: float
                - density_level: str (low, medium, high, critical)
                - risk_score: float
            
        Returns:
            Alert dictionary or None
        """
        try:
            density_level = density_info.get('density_level')
            
            # Only generate alerts for high or critical density
            if density_level not in ['high', 'critical']:
                return None
            
            # Check if alert is still in cooldown
            if self._is_in_cooldown(camera_id):
                logger.debug(f"Alert for camera {camera_id} still in cooldown")
                return None
            
            alert = {
                'camera_id': camera_id,
                'type': 'overcrowding',
                'severity': 'high' if density_level == 'high' else 'critical',
                'people_count': density_info.get('people_count'),
                'density_percentage': density_info.get('density_percentage'),
                'density_level': density_level,
                'risk_score': density_info.get('risk_score'),
                'timestamp': datetime.utcnow().isoformat(),
                'alert_id': self._generate_alert_id(camera_id)
            }
            
            # Update cooldown
            self.alert_history[camera_id] = datetime.utcnow()
            
            logger.warning(f"Alert generated - Camera: {camera_id}, Severity: {alert['severity']}, Density: {density_info.get('density_percentage')}%")
            return alert
        
        except Exception as e:
            logger.error(f"Error generating alert: {str(e)}")
            return None
    
    def generate_batch_alerts(self, detections: list):
        """
        Generate alerts for multiple camera detections
        
        Args:
            detections: List of detection dictionaries
            
        Returns:
            List of generated alerts
        """
        alerts = []
        
        try:
            for detection in detections:
                camera_id = detection.get('camera_id')
                density_info = {
                    'people_count': detection.get('people_count'),
                    'density_percentage': detection.get('density_percentage'),
                    'density_level': detection.get('density_level'),
                    'risk_score': detection.get('risk_score')
                }
                
                alert = self.generate_alert(camera_id, density_info)
                if alert:
                    alerts.append(alert)
            
            return alerts
        
        except Exception as e:
            logger.error(f"Error generating batch alerts: {str(e)}")
            return alerts
    
    def _is_in_cooldown(self, camera_id: str):
        """Check if camera alert is still in cooldown period"""
        if camera_id not in self.alert_history:
            return False
        
        from datetime import timedelta
        last_alert_time = self.alert_history[camera_id]
        if datetime.utcnow() - last_alert_time < timedelta(seconds=self.alert_cooldown):
            return True
        
        return False
    
    def _generate_alert_id(self, camera_id: str):
        """Generate unique alert ID"""
        import uuid
        return f"ALERT_{camera_id}_{int(datetime.utcnow().timestamp())}"
    
    def set_cooldown(self, seconds: int):
        """Update cooldown period between alerts for same camera"""
        self.alert_cooldown = seconds
        logger.info(f"Alert cooldown updated to {seconds} seconds")
    
    def clear_cooldown(self, camera_id: str = None):
        """Clear cooldown for specific camera or all cameras"""
        if camera_id:
            if camera_id in self.alert_history:
                del self.alert_history[camera_id]
                logger.info(f"Cooldown cleared for camera {camera_id}")
        else:
            self.alert_history.clear()
            logger.info("All alert cooldowns cleared")
    
    def get_alert_summary(self):
        """Get summary of active alerts and cooldowns"""
        return {
            'total_cameras_on_cooldown': len(self.alert_history),
            'cooldown_period_seconds': self.alert_cooldown,
            'cameras': list(self.alert_history.keys())
        }
