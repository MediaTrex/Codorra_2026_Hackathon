from app.config.database import get_collection
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Optional
import math


class HeatmapService:
    """Comprehensive heatmap service for density visualization and analysis"""

    @staticmethod
    def normalize_intensity(density_percentage: float) -> float:
        """Normalize density to 0-1 intensity scale"""
        return min(1.0, max(0.0, density_percentage / 100.0))

    @staticmethod
    def get_risk_level(density_percentage: float) -> str:
        """Determine risk level based on density"""
        if density_percentage >= 85:
            return "critical"
        elif density_percentage >= 70:
            return "high"
        elif density_percentage >= 50:
            return "medium"
        else:
            return "low"

    @staticmethod
    async def get_heatmap_data(period_hours: int = 1, camera_ids: List[str] = None):
        """Get heatmap data for specified period"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")

            # Get data from last N hours
            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Build query
            query = {"timestamp": {"$gte": time_threshold}}
            if camera_ids:
                query["camera_id"] = {"$in": [ObjectId(cid) if ObjectId.is_valid(cid) else cid for cid in camera_ids]}

            # Get latest detection per camera
            pipeline = [
                {"$match": query},
                {"$sort": {"timestamp": -1}},
                {"$group": {
                    "_id": "$camera_id",
                    "latest_doc": {"$first": "$$ROOT"}
                }},
                {"$replaceRoot": {"newRoot": "$latest_doc"}},
                {"$limit": 100}
            ]

            latest_detections = await detections_col.aggregate(pipeline).to_list(None)

            # Enrich with camera info and generate heatmap points
            points = []
            bounds = {"min_lat": 90, "max_lat": -90, "min_lng": 180, "max_lng": -180}

            for detection in latest_detections:
                camera = await cameras_col.find_one({"_id": detection.get("camera_id")})
                if camera:
                    point = {
                        "latitude": camera.get("latitude"),
                        "longitude": camera.get("longitude"),
                        "intensity": HeatmapService.normalize_intensity(detection.get("density_percentage", 0)),
                        "camera_id": str(detection.get("camera_id")),
                        "camera_name": camera.get("name"),
                        "people_count": detection.get("people_count"),
                        "density_percentage": detection.get("density_percentage"),
                        "timestamp": detection.get("timestamp")
                    }
                    points.append(point)

                    # Update bounds
                    bounds["min_lat"] = min(bounds["min_lat"], camera.get("latitude"))
                    bounds["max_lat"] = max(bounds["max_lat"], camera.get("latitude"))
                    bounds["min_lng"] = min(bounds["min_lng"], camera.get("longitude"))
                    bounds["max_lng"] = max(bounds["max_lng"], camera.get("longitude"))

            return {
                "success": True,
                "data": {
                    "generated_at": datetime.utcnow(),
                    "period_hours": period_hours,
                    "total_cameras": len(points),
                    "points": points,
                    "bounds": bounds if points else None
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_zone_risk_analysis(period_hours: int = 24):
        """Analyze risk levels by zone/location"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")
            alerts_col = await get_collection("alerts")

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Get all cameras
            all_cameras = await cameras_col.find({}).to_list(None)

            zones = {}

            for camera in all_cameras:
                location = camera.get("location", "Unknown")
                if location not in zones:
                    zones[location] = {
                        "zone_id": str(camera.get("_id")),
                        "zone_name": location,
                        "cameras": [],
                        "densities": [],
                        "alerts": 0
                    }

                # Get detection data for this camera
                detections = await detections_col.find({
                    "camera_id": camera.get("_id"),
                    "timestamp": {"$gte": time_threshold}
                }).to_list(None)

                if detections:
                    densities = [d.get("density_percentage", 0) for d in detections]
                    zones[location]["densities"].extend(densities)
                    zones[location]["cameras"].append({
                        "camera_id": str(camera.get("_id")),
                        "camera_name": camera.get("name"),
                        "latitude": camera.get("latitude"),
                        "longitude": camera.get("longitude"),
                        "current_density": densities[-1] if densities else 0
                    })

                # Count alerts for this camera
                alert_count = await alerts_col.count_documents({
                    "camera_id": camera.get("_id"),
                    "created_at": {"$gte": time_threshold}
                })
                zones[location]["alerts"] += alert_count

            # Calculate statistics for each zone
            zone_results = []
            for zone_name, zone_data in zones.items():
                if zone_data["densities"]:
                    avg_density = sum(zone_data["densities"]) / len(zone_data["densities"])
                    peak_density = max(zone_data["densities"])
                    min_density = min(zone_data["densities"])
                    high_alerts = len([d for d in zone_data["densities"] if d >= 70])
                    critical_alerts = len([d for d in zone_data["densities"] if d >= 85])
                else:
                    avg_density = 0
                    peak_density = 0
                    min_density = 0
                    high_alerts = 0
                    critical_alerts = 0

                zone_results.append({
                    "zone_id": zone_data["zone_id"],
                    "zone_name": zone_name,
                    "average_density": round(avg_density, 2),
                    "peak_density": round(peak_density, 2),
                    "min_density": round(min_density, 2),
                    "risk_level": HeatmapService.get_risk_level(avg_density),
                    "camera_count": len(zone_data["cameras"]),
                    "cameras": zone_data["cameras"],
                    "total_readings": len(zone_data["densities"]),
                    "high_alert_count": high_alerts,
                    "critical_alert_count": critical_alerts
                })

            # Sort by risk level (critical first)
            risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            zone_results.sort(key=lambda x: risk_order.get(x["risk_level"], 4))

            return {"success": True, "zones": zone_results}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_camera_heatmap_history(camera_id: str, period_hours: int = 24):
        """Get historical heatmap data for a specific camera"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")

            if not ObjectId.is_valid(camera_id):
                return {"success": False, "message": "Invalid camera ID"}

            camera = await cameras_col.find_one({"_id": ObjectId(camera_id)})
            if not camera:
                return {"success": False, "message": "Camera not found"}

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            detections = await detections_col.find({
                "camera_id": ObjectId(camera_id),
                "timestamp": {"$gte": time_threshold}
            }).sort("timestamp", -1).to_list(None)

            if not detections:
                return {"success": False, "message": "No detection data found"}

            # Prepare time series data
            data_points = []
            for detection in reversed(detections):
                data_points.append({
                    "timestamp": detection.get("timestamp"),
                    "density_percentage": detection.get("density_percentage"),
                    "people_count": detection.get("people_count"),
                    "density_level": detection.get("density_level"),
                    "risk_score": detection.get("risk_score")
                })

            # Calculate statistics
            densities = [d.get("density_percentage", 0) for d in detections]
            avg_density = sum(densities) / len(densities) if densities else 0
            peak_density = max(densities) if densities else 0
            min_density = min(densities) if densities else 0

            return {
                "success": True,
                "data": {
                    "camera_id": camera_id,
                    "camera_name": camera.get("name"),
                    "period_hours": period_hours,
                    "data_points": data_points,
                    "average_density": round(avg_density, 2),
                    "peak_density": round(peak_density, 2),
                    "min_density": round(min_density, 2),
                    "total_readings": len(detections)
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_heatmap_summary(period_hours: int = 24):
        """Get overall heatmap summary"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")
            alerts_col = await get_collection("alerts")

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Get all cameras
            all_cameras = await cameras_col.find({"status": "active"}).to_list(None)
            total_cameras = len(all_cameras)

            # Get latest detections
            pipeline = [
                {"$match": {"timestamp": {"$gte": time_threshold}}},
                {"$sort": {"timestamp": -1}},
                {"$group": {
                    "_id": "$camera_id",
                    "latest_doc": {"$first": "$$ROOT"}
                }},
                {"$replaceRoot": {"newRoot": "$latest_doc"}}
            ]

            latest_detections = await detections_col.aggregate(pipeline).to_list(None)
            active_cameras = len(latest_detections)

            # Calculate density statistics
            if latest_detections:
                densities = [d.get("density_percentage", 0) for d in latest_detections]
                avg_system_density = sum(densities) / len(densities)
                peak_system_density = max(densities)
            else:
                avg_system_density = 0
                peak_system_density = 0

            # Count risk zones
            all_detections = await detections_col.find({
                "timestamp": {"$gte": time_threshold}
            }).to_list(None)

            high_risk_count = len([d for d in all_detections if d.get("density_percentage", 0) >= 70])
            critical_risk_count = len([d for d in all_detections if d.get("density_percentage", 0) >= 85])

            # Count alerts
            total_alerts = await alerts_col.count_documents({
                "created_at": {"$gte": time_threshold}
            })
            active_alerts = await alerts_col.count_documents({
                "status": "active",
                "created_at": {"$gte": time_threshold}
            })

            return {
                "success": True,
                "summary": {
                    "total_cameras": total_cameras,
                    "active_cameras": active_cameras,
                    "average_system_density": round(avg_system_density, 2),
                    "peak_system_density": round(peak_system_density, 2),
                    "high_risk_zones": high_risk_count,
                    "critical_risk_zones": critical_risk_count,
                    "total_alerts": total_alerts,
                    "active_alerts": active_alerts,
                    "generated_at": datetime.utcnow(),
                    "period_hours": period_hours
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_density_trends(camera_id: str, period_hours: int = 24, interval_minutes: int = 60):
        """Get density trends with aggregation"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")

            if not ObjectId.is_valid(camera_id):
                return {"success": False, "message": "Invalid camera ID"}

            camera = await cameras_col.find_one({"_id": ObjectId(camera_id)})
            if not camera:
                return {"success": False, "message": "Camera not found"}

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Aggregate by time interval
            pipeline = [
                {
                    "$match": {
                        "camera_id": ObjectId(camera_id),
                        "timestamp": {"$gte": time_threshold}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$toDate": {
                                "$multiply": [
                                    {"$floor": {"$divide": [{"$toLong": "$timestamp"}, interval_minutes * 60000]}},
                                    interval_minutes * 60000
                                ]
                            }
                        },
                        "avg_density": {"$avg": "$density_percentage"},
                        "max_density": {"$max": "$density_percentage"},
                        "min_density": {"$min": "$density_percentage"},
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]

            trends = await detections_col.aggregate(pipeline).to_list(None)

            return {
                "success": True,
                "data": {
                    "camera_id": camera_id,
                    "camera_name": camera.get("name"),
                    "period_hours": period_hours,
                    "interval_minutes": interval_minutes,
                    "trends": trends
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
