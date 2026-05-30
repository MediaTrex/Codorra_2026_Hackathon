from app.config.database import get_collection
from app.config.settings import get_settings
from app.schemas.detection_schema import DetectionRequest
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List

settings = get_settings()

class DetectionService:
    """Detection service for density logging and analysis"""
    
    @staticmethod
    def serialize_doc(data):
        """Recursively serialize MongoDB ObjectIds"""

        if isinstance(data, list):
            return [DetectionService.serialize_doc(item) for item in data]

        if isinstance(data, dict):
            return {
            key: DetectionService.serialize_doc(value)
            for key, value in data.items()
        }

        if isinstance(data, ObjectId):
         return str(data)

        return data
    
    
    @staticmethod
    async def create_detection(detection_data: DetectionRequest):
        """Create new detection log"""
        try:
            detections_collection = await get_collection("density_logs")
            cameras_collection = await get_collection("cameras")
            alerts_collection = await get_collection("alerts")
            
            # Check if camera exists
            camera = await cameras_collection.find_one({"_id": ObjectId(detection_data.camera_id)})
            if not camera:
                return {"success": False, "message": "Camera not found"}
            
            # Determine if alert should be generated
            alert_generated = detection_data.density_level in ["high", "critical"]
            
            detection_doc = {
                "camera_id": ObjectId(detection_data.camera_id),
                "people_count": detection_data.people_count,
                "density_percentage": detection_data.density_percentage,
                "density_level": detection_data.density_level,
                "risk_score": detection_data.risk_score,
                "alert_generated": alert_generated,
                "frame_data": detection_data.frame_data,
                "timestamp": datetime.utcnow()
            }
            
            result = await detections_collection.insert_one(detection_doc)
            
            # Generate alert if needed
            if alert_generated:
                alert_doc = {
                    "camera_id": ObjectId(detection_data.camera_id),
                    "camera_name": camera.get("name"),
                    "location": camera.get("location"),
                    "type": "overcrowding",
                    "severity": "high" if detection_data.density_level == "high" else "critical",
                    "people_count": detection_data.people_count,
                    "density_percentage": detection_data.density_percentage,
                    "status": "active",
                    "created_at": datetime.utcnow(),
                    "resolved_at": None
                }
                await alerts_collection.insert_one(alert_doc)
            
            return {
                "success": True,
                "message": "Detection logged successfully",
                "detection_id": str(result.inserted_id),
                "alert_generated": alert_generated
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    @staticmethod
    async def get_live_detections():
        """Get latest detection for each camera"""
        try:
            detections_collection = await get_collection("density_logs")
            cameras_collection = await get_collection("cameras")
            
            # Get latest detections for each camera
            pipeline = [
                {"$group": {
                    "_id": "$camera_id",
                    "latest_doc": {"$first": "$$ROOT"}
                }},
                {"$replaceRoot": {"newRoot": "$latest_doc"}},
                {"$sort": {"timestamp": -1}},
                {"$limit": 100}
            ]
            
            latest_detections = await detections_collection.aggregate(pipeline).to_list(None)
            
            # Enrich with camera info
            result = []
            for detection in latest_detections:
                camera = await cameras_collection.find_one({"_id": ObjectId(detection["camera_id"])})
                if camera:
                    result.append({
                        "camera_id": str(detection["camera_id"]),
                        "camera_name": camera.get("name"),
                        "location": camera.get("location"),
                        "people_count": detection.get("people_count"),
                        "density_percentage": detection.get("density_percentage"),
                        "density_level": detection.get("density_level"),
                        "risk_score": detection.get("risk_score"),
                        "capacity": camera.get("capacity"),
                        "alert_generated": detection.get("alert_generated"),
                        "timestamp": detection.get("timestamp")
                    })
            
            return {"success": True, "detections": result, "total": len(result)}
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    @staticmethod
    async def get_camera_detections(camera_id: str, limit: int = 50):
        """Get detection history for specific camera"""
        try:
            detections_collection = await get_collection("density_logs")
            
            query_id = ObjectId(camera_id) if ObjectId.is_valid(camera_id) else camera_id
            
            detections = await detections_collection.find(
                {"camera_id": query_id}
            ).sort("timestamp", -1).limit(limit).to_list(None)
            
            return {
                "success": True,
                "camera_id": camera_id,
                "detections": DetectionService.serialize_doc(detections),
                "total": len(detections)
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    @staticmethod
    async def get_density_trends(camera_id: str, period_hours: int = 24):
        """Get density trends for analytics"""
        try:
            detections_collection = await get_collection("density_logs")
            cameras_collection = await get_collection("cameras")
            
            # Get data from last N hours
            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)
            
            query_id = ObjectId(camera_id) if ObjectId.is_valid(camera_id) else camera_id
            
            detections = await detections_collection.find({
                "camera_id": query_id,
                "timestamp": {"$gte": time_threshold}
            }).to_list(None)
            
            if not detections:
                return {"success": False, "message": "No detection data found"}
            
            # Calculate statistics
            density_values = [d.get("density_percentage", 0) for d in detections]
            high_alerts = len([d for d in detections if d.get("density_level") == "high"])
            critical_alerts = len([d for d in detections if d.get("density_level") == "critical"])
            
            camera = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
            
            return {
                "success": True,
                "camera_id": camera_id,
                "camera_name": camera.get("name") if camera else "Unknown",
                "location": camera.get("location") if camera else "Unknown",
                "average_density": round(sum(density_values) / len(density_values), 2),
                "peak_density": max(density_values),
                "min_density": min(density_values),
                "total_readings": len(detections),
                "high_alert_count": high_alerts,
                "critical_alert_count": critical_alerts,
                "period_hours": period_hours
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

