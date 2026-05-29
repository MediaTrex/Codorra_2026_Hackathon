from app.config.database import get_collection
from app.schemas.camera_schema import CreateCameraRequest, UpdateCameraRequest
from bson import ObjectId
from datetime import datetime


class CameraService:
    """Camera service for CRUD operations"""

    @staticmethod
    def serialize_camera(camera):
        """Convert MongoDB document to JSON serializable dict"""
        if camera:
            camera["_id"] = str(camera["_id"])

        return camera

    @staticmethod
    async def create_camera(camera_data: CreateCameraRequest, user_id: str):
        """Create new camera"""
        try:
            cameras_collection = await get_collection("cameras")

            camera_doc = {
                "name": camera_data.name,
                "location": camera_data.location,
                "latitude": camera_data.latitude,
                "longitude": camera_data.longitude,
                "stream_url": camera_data.stream_url,
                "capacity": camera_data.capacity,
                "status": "active",
                "description": camera_data.description,
                "created_by": user_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = await cameras_collection.insert_one(camera_doc)

            return {
                "success": True,
                "message": "Camera created successfully",
                "camera_id": str(result.inserted_id)
            }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_all_cameras():
        """Get all cameras"""
        try:
            cameras_collection = await get_collection("cameras")

            cameras = await cameras_collection.find({}).to_list(None)

            serialized_cameras = [
                CameraService.serialize_camera(camera)
                for camera in cameras
            ]

            return {
                "success": True,
                "cameras": serialized_cameras,
                "total": len(serialized_cameras)
            }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_camera(camera_id: str):
        """Get single camera by ID"""
        try:
            cameras_collection = await get_collection("cameras")

            camera = await cameras_collection.find_one({
                "_id": ObjectId(camera_id)
            })

            if not camera:
                return {
                    "success": False,
                    "message": "Camera not found"
                }

            return {
                "success": True,
                "camera": CameraService.serialize_camera(camera)
            }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def update_camera(camera_id: str, update_data: UpdateCameraRequest):
        """Update camera"""
        try:
            cameras_collection = await get_collection("cameras")

            update_dict = {}

            if update_data.name:
                update_dict["name"] = update_data.name

            if update_data.location:
                update_dict["location"] = update_data.location

            if update_data.latitude is not None:
                update_dict["latitude"] = update_data.latitude

            if update_data.longitude is not None:
                update_dict["longitude"] = update_data.longitude

            if update_data.stream_url:
                update_dict["stream_url"] = update_data.stream_url

            if update_data.capacity:
                update_dict["capacity"] = update_data.capacity

            if update_data.status:
                update_dict["status"] = update_data.status

            if update_data.description is not None:
                update_dict["description"] = update_data.description

            update_dict["updated_at"] = datetime.utcnow()

            result = await cameras_collection.update_one(
                {"_id": ObjectId(camera_id)},
                {"$set": update_dict}
            )

            if result.matched_count == 0:
                return {
                    "success": False,
                    "message": "Camera not found"
                }

            return {
                "success": True,
                "message": "Camera updated successfully"
            }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def delete_camera(camera_id: str):
        """Delete camera"""
        try:
            cameras_collection = await get_collection("cameras")

            result = await cameras_collection.delete_one({
                "_id": ObjectId(camera_id)
            })

            if result.deleted_count == 0:
                return {
                    "success": False,
                    "message": "Camera not found"
                }

            return {
                "success": True,
                "message": "Camera deleted successfully"
            }

        except Exception as e:
            return {"success": False, "message": str(e)}