## APIs

### **Root APIs**

```
GET /api/ — API status and version.
GET /api/docs — API documentation (Swagger/OpenAPI).
GET /health — health check endpoint.
```


### **Auth APIs**

```
POST /api/auth/register — register user. Body: username, email, password, role (admin/standard). Returns user_id.
POST /api/auth/login — login user. Body: username, password. Returns Cookies: auth_token.
POST /api/auth/logout — invalidate cookie (optional, can also rely on expiration).
GET /api/auth/me — get current user info (requires auth).
```


### **Camera APIs**

```
POST /api/cameras — create camera. Body: name, location, latitude, longitude, stream_url, capacity, description. Returns camera_id.
GET /api/cameras — list cameras.
GET /api/cameras/{id} — camera details.
PUT /api/cameras/{id} — update fields (same as create, optional).
DELETE /api/cameras/{id} — remove camera.

Stores in collection: cameras.
```


### **Detection APIs**

```
POST /api/detections — log detection from AI. Body: camera_id, people_count, density_percentage, density_level (low|medium|high|critical), risk_score, optional frame_data. Creates density_logs entry; generates alert (alerts collection) if high/critical.
GET /api/detections/live — latest per camera.
GET /api/detections/{camera_id}/history?limit=
GET /api/detections/{camera_id}/trends?hours=
Responses: JSON with success, data, ids, totals.
```

---

### **Heatmap APIs**

```
GET /api/heatmap/data?period_hours=1&camera_ids=[]
  Returns: Heatmap points with latitude, longitude, intensity (0-1), people_count, density_percentage
GET /api/heatmap/summary?period_hours=24
  Returns: Overall system summary
GET /api/heatmap/zones/risk?period_hours=24
  Returns: Risk analysis by zone/location
GET /api/heatmap/camera/{camera_id}/history?period_hours=24
  Returns: Historical density data for a camera
GET /api/heatmap/camera/{camera_id}/trends?period_hours=24&interval_minutes=60
  Returns: Density trends with time aggregation
GET /api/heatmap/stats/live
  Returns: Live heatmap statistics (1-hour period)
GET /api/heatmap/health
  Returns: Health check for heatmap service
```

---

### **Alerts APIs** 

```
GET /api/alerts?status=&severity=&camera_id=&limit=50&skip=0
  List alerts with filtering
  - Filter by: status (active|resolved|acknowledged|dismissed)
  - Filter by: severity (critical|high|medium|low|info)
  - Filter by: camera_id
  - Supports pagination (limit, skip)
  Returns: total count and alert list

GET /api/alerts/statistics?period_hours=24
  Get alert statistics for a period
  - total_alerts, active_alerts, resolved_alerts
  - critical_alerts, high_alerts, medium_alerts, low_alerts
  - Breakdown by camera, type, and severity
  Returns: Aggregated statistics with counts

GET /api/alerts/{alert_id}
  Get specific alert details
  - Full alert information with all metadata

POST /api/alerts/{alert_id}/resolve
  Resolve an alert
  Body: { "note": "string", "resolution_status": "resolved" }
  - Sets status to "resolved"
  - Records resolved_by (user ID), resolved_at (timestamp)
  - Optional resolve_note

POST /api/alerts/{alert_id}/acknowledge
  Acknowledge an alert (mark as seen/in-progress)
  Body: { "note": "string" }
  - Sets status to "acknowledged"
  - Records acknowledged_by (user ID), acknowledge_at (timestamp)
  - Optional acknowledge_note

POST /api/alerts/{alert_id}/dismiss
  Dismiss an alert (false alarm or temporary issue)
  Body: { "reason": "string" }
  - Sets status to "dismissed"
  - Records dismissed_by (user ID), dismiss_at (timestamp)
  - Optional dismiss_reason

POST /api/alerts/bulk/resolve?note=string
  Resolve multiple alerts at once
  Body: { "alert_ids": ["id1", "id2", ...] }
  - Bulk operation for efficiency
  - Records resolved_by for all
  - Returns modified_count
```

---

## Data Models

### Alert Document
```json
{
  "_id": "ObjectId",
  "camera_id": "ObjectId",
  "camera_name": "string",
  "location": "string",
  "type": "overcrowding|unusual_activity|system_error|low_capacity",
  "severity": "critical|high|medium|low|info",
  "title": "string",
  "message": "string",
  "status": "active|resolved|acknowledged|dismissed",
  "people_count": "number",
  "density_percentage": "number",
  "created_at": "datetime",
  "resolved_at": "datetime | null",
  "resolved_by": "string | null",
  "resolve_note": "string | null",
  "acknowledge_at": "datetime | null",
  "acknowledged_by": "string | null",
  "acknowledge_note": "string | null",
  "dismiss_at": "datetime | null",
  "dismissed_by": "string | null",
  "dismiss_reason": "string | null",
  "frame_data": "object | null"
}
```

### Heatmap Point
```json
{
  "latitude": "float",
  "longitude": "float",
  "intensity": "float (0-1)",
  "camera_id": "string",
  "camera_name": "string",
  "people_count": "number",
  "density_percentage": "float",
  "timestamp": "datetime"
}
```

### Risk Level Mapping
```
density_percentage >= 85% → "critical"
density_percentage >= 70% → "high"
density_percentage >= 50% → "medium"
density_percentage < 50%  → "low"
```

---

## Architecture

```
    [CCTV / Webcam]
           ↓
      Camera API
  (register/manage streams)
           ↓
   YOLO Detection Model
           ↓
     Detection API
  (store crowd results)
           ↓
        MongoDB
      (4 collections)
      ├─ cameras
      ├─ density_logs
      ├─ alerts
      └─ users
           ↓
    Heatmap + Alerts
    (Real-time Dashboard)
```

---

## Key Features Implemented

### Heatmap Service
- ✅ Real-time density visualization with geographic coordinates
- ✅ Zone-based risk analysis and aggregation
- ✅ Historical trend analysis with configurable time intervals
- ✅ Summary statistics for system-wide monitoring
- ✅ Normalized intensity mapping (0-1 scale)
- ✅ Geographic bounds calculation for map rendering

### Alert Service
- ✅ Multi-status alert lifecycle (active → acknowledged/resolved/dismissed)
- ✅ Severity-based filtering and categorization
- ✅ Bulk alert operations for batch processing
- ✅ Comprehensive alert statistics and aggregation
- ✅ User attribution for all actions (resolved_by, acknowledged_by, etc.)
- ✅ Optional notes/reasons for audit trails
- ✅ Alert auto-generation from high/critical detections

### Query Capabilities
- ✅ Time-based filtering (period_hours parameter)
- ✅ Camera-based filtering
- ✅ Status and severity filtering
- ✅ Geographic zone analysis
- ✅ Trend aggregation with configurable intervals
- ✅ Pagination support for list endpoints
