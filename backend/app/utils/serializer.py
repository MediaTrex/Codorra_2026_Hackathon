from bson import ObjectId
from datetime import datetime


def serialize_mongo(data):
    """Recursively serialize MongoDB documents"""

    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]

    if isinstance(data, dict):
        return {
            key: serialize_mongo(value)
            for key, value in data.items()
        }

    if isinstance(data, ObjectId):
        return str(data)

    if isinstance(data, datetime):
        return data.isoformat()

    return data