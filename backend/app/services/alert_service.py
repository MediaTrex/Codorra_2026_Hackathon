from app.config.database import get_collection
from app.utils.serializer import serialize_mongo
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional, List

class AlertService:
    """Comprehensive alert service"""

    @staticmethod
    async def list_alerts(status: str = None, severity: str = None, limit: int = 50, skip: int = 0, camera_id: str = None):
        """List alerts with filters"""
        alerts_col = await get_collection("alerts")
        query = {}
        if status:
            query["status"] = status
        if severity:
            query["severity"] = severity
        if camera_id:
            query["camera_id"] = ObjectId(camera_id) if ObjectId.is_valid(camera_id) else camera_id
        
        cursor = alerts_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
        alerts = await cursor.to_list(length=limit)
        total = await alerts_col.count_documents(query)
        
        # Serialize ObjectIds
        serialized_alerts = []
        for alert in alerts:
            alert["_id"] = str(alert["_id"])
            if isinstance(alert.get("camera_id"), ObjectId):
                alert["camera_id"] = str(alert["camera_id"])
            serialized_alerts.append(alert)
        
        return {"success": True, "total": total, "alerts": serialized_alerts}

    @staticmethod
    async def get_alert(alert_id: str):
        """Get single alert"""
        alerts_col = await get_collection("alerts")
        if not ObjectId.is_valid(alert_id):
            return {"success": False, "message": "Invalid alert ID"}
        
        alert = await alerts_col.find_one({"_id": ObjectId(alert_id)})
        if not alert:
            return {"success": False, "message": "Alert not found"}
        
        alert["_id"] = str(alert["_id"])
        if isinstance(alert.get("camera_id"), ObjectId):
            alert["camera_id"] = str(alert["camera_id"])
        
        return {"success": True, "alert": alert}

    @staticmethod
    async def resolve_alert(alert_id: str, resolved_by: str = None, note: str = None):
        """Resolve an alert"""
        alerts_col = await get_collection("alerts")
        if not ObjectId.is_valid(alert_id):
            return {"success": False, "message": "Invalid alert ID"}
        
        update = {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.utcnow(),
                "resolved_by": resolved_by,
                "resolve_note": note
            }
        }
        result = await alerts_col.update_one({"_id": ObjectId(alert_id)}, update)
        if result.matched_count == 0:
            return {"success": False, "message": "Alert not found"}
        return {"success": True, "message": "Alert resolved"}

    @staticmethod
    async def acknowledge_alert(alert_id: str, acknowledged_by: str = None, note: str = None):
        """Acknowledge an alert"""
        alerts_col = await get_collection("alerts")
        if not ObjectId.is_valid(alert_id):
            return {"success": False, "message": "Invalid alert ID"}
        
        update = {
            "$set": {
                "status": "acknowledged",
                "acknowledge_at": datetime.utcnow(),
                "acknowledged_by": acknowledged_by,
                "acknowledge_note": note
            }
        }
        result = await alerts_col.update_one({"_id": ObjectId(alert_id)}, update)
        if result.matched_count == 0:
            return {"success": False, "message": "Alert not found"}
        return {"success": True, "message": "Alert acknowledged"}

    @staticmethod
    async def dismiss_alert(alert_id: str, dismissed_by: str = None, reason: str = None):
        """Dismiss an alert"""
        alerts_col = await get_collection("alerts")
        if not ObjectId.is_valid(alert_id):
            return {"success": False, "message": "Invalid alert ID"}
        
        update = {
            "$set": {
                "status": "dismissed",
                "dismiss_at": datetime.utcnow(),
                "dismissed_by": dismissed_by,
                "dismiss_reason": reason
            }
        }
        result = await alerts_col.update_one({"_id": ObjectId(alert_id)}, update)
        if result.matched_count == 0:
            return {"success": False, "message": "Alert not found"}
        return {"success": True, "message": "Alert dismissed"}

    @staticmethod
    async def create_alert(camera_id: str, alert_type: str, severity: str, title: str, message: str, 
                          people_count: int = None, density_percentage: float = None, camera_name: str = None, 
                          location: str = None, frame_data: dict = None):
        """Create a new alert"""
        alerts_col = await get_collection("alerts")
        
        alert_doc = {
            "camera_id": ObjectId(camera_id) if ObjectId.is_valid(camera_id) else camera_id,
            "camera_name": camera_name,
            "location": location,
            "type": alert_type,
            "severity": severity,
            "title": title,
            "message": message,
            "people_count": people_count,
            "density_percentage": density_percentage,
            "status": "active",
            "created_at": datetime.utcnow(),
            "resolved_at": None,
            "frame_data": frame_data
        }
        res = await alerts_col.insert_one(alert_doc)
        return {"success": True, "alert_id": str(res.inserted_id)}

    @staticmethod
    async def create_alert_from_detection(detection, camera):
        """Create alert from detection data"""
        alerts_col = await get_collection("alerts")
        alert_doc = {
            "camera_id": detection.get("camera_id"),
            "camera_name": camera.get("name") if camera else None,
            "location": camera.get("location") if camera else None,
            "type": "overcrowding",
            "severity": "high" if detection.get("density_level") == "high" else "critical",
            "title": f"High Crowd Density at {camera.get('name') if camera else 'Camera'}",
            "message": f"Detected {detection.get('people_count')} people ({detection.get('density_percentage'):.1f}% density)",
            "people_count": detection.get("people_count"),
            "density_percentage": detection.get("density_percentage"),
            "status": "active",
            "created_at": datetime.utcnow(),
            "resolved_at": None,
            "frame_data": detection.get("frame_data")
        }
        res = await alerts_col.insert_one(alert_doc)
        return str(res.inserted_id)

    @staticmethod
    async def get_alert_statistics(period_hours: int = 24):
        """Get alert statistics"""
        alerts_col = await get_collection("alerts")
        
        time_threshold = datetime.utcnow() - timedelta(hours=period_hours)
        
        total = await alerts_col.count_documents({})
        active = await alerts_col.count_documents({"status": "active"})
        resolved = await alerts_col.count_documents({"status": "resolved"})
        critical = await alerts_col.count_documents({"severity": "critical"})
        high = await alerts_col.count_documents({"severity": "high"})
        medium = await alerts_col.count_documents({"severity": "medium"})
        low = await alerts_col.count_documents({"severity": "low"})
        
        # By camera
        by_camera = await alerts_col.aggregate([
            {"$group": {"_id": "$camera_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]).to_list(None)
        
        # By type
        by_type = await alerts_col.aggregate([
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(None)
        
        # By severity
        by_severity = await alerts_col.aggregate([
            {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(None)
        
        return serialize_mongo({
            "success": True,
            "statistics": {
                "total_alerts": total,
                "active_alerts": active,
                "resolved_alerts": resolved,
                "critical_alerts": critical,
                "high_alerts": high,
                "medium_alerts": medium,
                "low_alerts": low,
                "by_camera": by_camera,
                "by_type": by_type,
                "by_severity": by_severity
            }
        })

    @staticmethod
    async def bulk_resolve_alerts(alert_ids: List[str], resolved_by: str = None, note: str = None):
        """Resolve multiple alerts at once"""
        alerts_col = await get_collection("alerts")
        
        obj_ids = []
        for alert_id in alert_ids:
            if ObjectId.is_valid(alert_id):
                obj_ids.append(ObjectId(alert_id))
        
        if not obj_ids:
            return {"success": False, "message": "No valid alert IDs provided"}
        
        result = await alerts_col.update_many(
            {"_id": {"$in": obj_ids}},
            {
                "$set": {
                    "status": "resolved",
                    "resolved_at": datetime.utcnow(),
                    "resolved_by": resolved_by,
                    "resolve_note": note
                }
            }
        )
        
        return {"success": True, "modified_count": result.modified_count}

