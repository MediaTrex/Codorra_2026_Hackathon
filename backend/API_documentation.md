## APIs

### **Root APIs**

```
GET /api/ — API status and version.
GET /api/docs — API documentation (Swagger/OpenAPI).
GET /health — health check endpoint.
```


### **Auth APIs**

```
POST /api/auth/register
  Body (JSON):
    {
      "username": "string",
      "email": "user@example.com",
      "password": "string (min 8)",
      "role": "admin|standard"  # optional, default: "standard"
    }
  Returns: { "success": true, "user_id": "<id>" }

POST /api/auth/login
  Body (JSON):
    {
      "username": "string",
      "password": "string"
    }
  Returns: { "success": true, "token": "jwt-token" } and sets auth cookie

POST /api/auth/logout
  Body: none (uses auth token/cookie)
  Returns: { "success": true }

GET /api/auth/me
  Body: none
  Returns: { "success": true, "user": {"_id": "...", "username": "...", "email": "...", "role": "..."} }
```


### **Camera APIs**

```
POST /api/cameras
  Body (JSON):
    {
      "name": "string",
      "location": "string",
      "latitude": 27.7172,
      "longitude": 85.3240,
      "stream_url": "http://camera-stream.local/stream",
      "capacity": 100,
      "status": "active|inactive|maintenance",  # optional
      "description": "string",
      "created_by": "user_id"
    }
  Returns: { "success": true, "camera_id": "<id>" }

GET /api/cameras
  Query params: limit, skip, status
  Returns: list of cameras

GET /api/cameras/{id}
  Path: camera id
  Returns: full camera details

PUT /api/cameras/{id}
  Body (JSON): same as create (only fields to update required)
  Returns: { "success": true, "message": "Camera updated" }

DELETE /api/cameras/{id}
  Body: none
  Returns: { "success": true, "message": "Camera deleted" }

Stores in collection: cameras.
```


### **Detection APIs**

```
POST /api/detections
  Body (JSON) (from AI engine):
    {
      "camera_id": "507f1f77bcf86cd799439011",
      "people_count": 85,
      "density_percentage": 85.0,
      "density_level": "low|medium|high|critical",
      "risk_score": 0.85,
      "frame_data": {"optional": "object"}  # optional, keep minimal or anonymized
    }
  Behavior: Inserts into `density_logs`. If density_level is high/critical an alert is created in `alerts` collection.
  Returns: { "success": true, "detection_id": "<id>", "alert_generated": true|false }

GET /api/detections/live
  Returns: latest detection per camera (enriched with camera info)

GET /api/detections/{camera_id}/history?limit=50
  Path: camera_id
  Query: limit (default 50)
  Returns: list of recent detections for the camera

GET /api/detections/{camera_id}/trends?hours=24
  Path: camera_id
  Query: hours (period to aggregate)
  Returns: trend analytics for the camera

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

### **Analytics APIs**

```
GET /api/analytics/system?period_hours=24
  - Returns: System-wide analytics (total cameras, active cameras, total detections, total alerts, average and peak system density, critical/high event counts, generated_at)

GET /api/analytics/camera/{camera_id}?period_hours=24
  - Returns: Per-camera analytics including density metrics (average, peak, min, median, std), peak hours, trend, risk_level

GET /api/analytics/temporal?period_hours=24&granularity=hourly&camera_id=
  - Returns: Time-series aggregation (hourly/daily/weekly/monthly) with avg/max/min densities and counts

GET /api/analytics/compare?camera_id1={id}&camera_id2={id}&period_hours=24
  - Returns: Comparison analytics between two cameras (avg/peak diffs, risk level)

GET /api/analytics/alerts?period_hours=24
  - Returns: Alert analytics (distribution by status/severity/type, average resolution time, total alerts)

GET /api/analytics/health
  - Returns: Health check for analytics service
```

Notes:
- Use `period_hours` to scope analytics to a recent window (1-720 hours).
- `temporal` supports `granularity` values: hourly (default), daily, weekly, monthly.
- Analytics endpoints are designed for dashboards, exports, and automated reports; responses are JSON-ready for charts.

---

### **Privacy APIs**

```
GET /api/privacy/compliance/report?report_period=monthly
  - Returns: Compliance summary and report metadata (data retention, anonymization, encryption, audit status)

GET /api/privacy/data-retention/policy
  - Returns: Current data retention settings and upcoming cleanup schedule

GET /api/privacy/audit-logs?user_id=&limit=100&skip=0
  - Returns: Audit logs for actions related to compliance and data access

GET /api/privacy/access-logs?endpoint=&period_hours=24&limit=100
  - Returns: Access logs for security auditing (endpoint, method, user, response time)

GET /api/privacy/anonymization/status
  - Returns: Status metrics for anonymization runs and PII removal coverage

POST /api/privacy/data/export
  - Creates an export request for the authenticated user's data (Right to Access)

POST /api/privacy/data/deletion?reason=...
  - Creates a data deletion request for the authenticated user (Right to be Forgotten)

GET /api/privacy/encryption/config
  - Returns: Current encryption configuration and rotation schedule

GET /api/privacy/access-control/policies
  - Returns: Access control policies for roles and allowed endpoints

GET /api/privacy/data-classification
  - Returns: Data classification schema with retention and encryption requirements

GET /api/privacy/compliance/verify
  - Returns: Automated PII compliance check results and recommendations

GET /api/privacy/health
  - Returns: Health check for privacy service
```

Notes:
- Privacy APIs support GDPR-like rights: data export and deletion requests are logged and scheduled.
- Audit and access logs support pagination and time-bounded queries for efficient compliance review.
- PII masking/anonymization functions operate on frame_data and detection records; policies are configurable via the retention API.

---

---

## Key Features Implemented

### Auth Service
- ✅ User registration and secure password hashing
- ✅ JWT-based authentication with token issuance and expiration
- ✅ Role-based access control (admin, manager, operator)
- ✅ Session management and logout / token revocation
- ✅ Endpoint: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout

### Camera Service
- ✅ Full CRUD for camera resources (location, stream, capacity)
- ✅ Geolocation metadata (latitude/longitude) for mapping
- ✅ Camera status flags (active/inactive/maintenance)
- ✅ Ownership and created_by attribution
- ✅ Pagination and filtering for listing

### Detection Service
- ✅ Ingestion endpoint for AI detections with validation
- ✅ Density/detection logging in `density_logs` collection
- ✅ Automatic alert generation for high/critical events
- ✅ Minimal PII in frame_data and anonymization options
- ✅ Live view and camera history endpoints

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

### Analytics Service
- ✅ System-wide aggregates (total cameras, detections, alerts)
- ✅ Per-camera analytics (avg/peak/min/median/std, trend, peak hours)
- ✅ Temporal aggregation (hourly/daily/weekly/monthly) for charts
- ✅ Comparison between cameras
- ✅ Alert analytics (status/severity/type distributions, resolution times)
- ✅ Designed for dashboards, reports, and exports

### Privacy & Compliance Service
- ✅ Data retention policies and scheduled cleanup
- ✅ PII masking/anonymization for frame and detection data
- ✅ Data export and deletion workflows (Right to Access / Right to be Forgotten)
- ✅ Audit and access logs for compliance reviews
- ✅ Encryption configuration and key rotation tracking
- ✅ Access control policies and data classification

### Query Capabilities
- ✅ Time-based filtering (period_hours parameter)
- ✅ Camera-based filtering
- ✅ Status and severity filtering
- ✅ Geographic zone analysis
- ✅ Trend aggregation with configurable intervals
- ✅ Pagination support for list endpoints

---

## Implementation Guidance

- All Analytics and Privacy endpoints require authentication and appropriate role-based access (admin/manager/operator).
- For heavy queries (long periods, high-resolution temporal), prefer asynchronous background exports rather than direct synchronous requests.
- Use the analytics `temporal` endpoint for charting time-series; it returns arrays of aggregated periods.
- Data export and deletion requests generate entries in `data_exports` and `data_deletions` collections respectively and follow scheduled processing workflows.

---

## Examples

- System analytics for last 24h:
  GET /api/analytics/system?period_hours=24

- Camera analytics daily granularity:
  GET /api/analytics/temporal?period_hours=168&granularity=daily&camera_id=507f1f...

- Request data deletion (user-evident):
  POST /api/privacy/data/deletion?reason=No longer required


End of documentation

