import aiohttp
import asyncio
from logger import logger
from config import settings
from typing import Dict, Optional
import json

class BackendAPIClient:
    """Client for communicating with FastAPI backend"""
    
    def __init__(self, base_url: str = None, api_key: str = None):
        """
        Initialize backend API client
        
        Args:
            base_url: Base URL of backend API
            api_key: API key for authentication
        """
        self.base_url = base_url or settings.BACKEND_API_URL
        self.api_key = api_key or settings.BACKEND_API_KEY
        self.headers = {
            'Content-Type': 'application/json'
        }
        if self.api_key:
            self.headers['Authorization'] = f"Bearer {self.api_key}"
        
        logger.info(f"BackendAPIClient initialized with base URL: {self.base_url}")
    
    async def submit_detection(self, detection_data: Dict):
        """
        Submit detection/density data to backend
        
        Args:
            detection_data: Dictionary containing:
            - camera_id: str
            - people_count: int
            - density_percentage: float
            - density_level: str
            - risk_score: float
            
        Returns:
            Response from backend
        """
        try:
            url = f"{self.base_url}/api/detections"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=detection_data,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    result = await response.json()
                    
                    if response.status in [200, 201]:
                        logger.info(f"Detection submitted successfully: {detection_data['camera_id']}")
                        return {'success': True, 'data': result}
                    else:
                        logger.error(f"Backend error: {response.status} - {result}")
                        return {'success': False, 'error': result}
        
        except asyncio.TimeoutError:
            logger.error("Request timeout while submitting detection")
            return {'success': False, 'error': 'Request timeout'}
        except Exception as e:
            logger.error(f"Error submitting detection: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def get_camera_info(self, camera_id: str):
        """
        Get camera information from backend
        
        Args:
            camera_id: ID of the camera
            
        Returns:
            Camera information or None
        """
        try:
            url = f"{self.base_url}/api/cameras/{camera_id}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Camera info retrieved: {camera_id}")
                        return result.get('camera')
                    else:
                        logger.error(f"Failed to get camera info: {response.status}")
                        return None
        
        except Exception as e:
            logger.error(f"Error getting camera info: {str(e)}")
            return None
    
    async def submit_alert(self, alert_data: Dict):
        """
        Submit overcrowding alert to backend
        
        Args:
            alert_data: Alert dictionary from AlertGenerator
            
        Returns:
            Response from backend
        """
        try:
            url = f"{self.base_url}/api/alerts"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=alert_data,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    result = await response.json()
                    
                    if response.status in [200, 201]:
                        logger.warning(f"Alert submitted: {alert_data['camera_id']} - {alert_data['severity']}")
                        return {'success': True, 'data': result}
                    else:
                        logger.error(f"Failed to submit alert: {response.status}")
                        return {'success': False, 'error': result}
        
        except Exception as e:
            logger.error(f"Error submitting alert: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def get_all_cameras(self):
        """
        Get list of all cameras from backend
        
        Returns:
            List of camera dictionaries or None
        """
        try:
            url = f"{self.base_url}/api/cameras"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        cameras = result.get('cameras', [])
                        logger.info(f"Retrieved {len(cameras)} cameras from backend")
                        return cameras
                    else:
                        logger.error(f"Failed to get cameras: {response.status}")
                        return None
        
        except Exception as e:
            logger.error(f"Error getting cameras: {str(e)}")
            return None
    
    async def health_check(self):
        """
        Check if backend is healthy and accessible
        
        Returns:
            Boolean indicating backend health
        """
        try:
            url = f"{self.base_url}/health"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    is_healthy = response.status == 200
                    logger.info(f"Backend health check: {'OK' if is_healthy else 'FAILED'}")
                    return is_healthy
        
        except Exception as e:
            logger.error(f"Backend health check failed: {str(e)}")
            return False
    
    def submit_detection_sync(self, detection_data: Dict):
        """Synchronous wrapper for submit_detection"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.submit_detection(detection_data))
        finally:
            loop.close()
    
    def submit_alert_sync(self, alert_data: Dict):
        """Synchronous wrapper for submit_alert"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.submit_alert(alert_data))
        finally:
            loop.close()
