# CrowdShield AI - Unified API & Workflow Guide

This guide documents the complete API surface of **CrowdShield AI** (FastAPI Backend + AI Engine) and details how they interact to provide real-time crowd density estimations, privacy-preserving face blurring, automatic alerts, and safety analytics.

---

##  System Overview & Port Mapping

*   **FastAPI Backend Server**: Exposes database interfaces, authentication, user sessions, camera configurations, heatmap generation, alert lifecycles, and compliance logs.
    *   **Port**: `http://localhost:8000`
    *   **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **AI Engine Server**: Exposes interfaces for deep learning inference (YOLOv8 person detection), centroid tracking, OpenCV face blurring, and video stream processing.
    *   **Port**: `http://localhost:8001`
    *   **Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## Authentication Mechanisms

CrowdShield AI supports two secure authentication mechanisms:

1.  **Session Cookie (`access_token`)**: Used for the ReactJS Frontend UI. Swagger UI sets this automatically after logging in via `/api/auth/login`.
2.  **API Key Bearer Token**: Used for background worker agents (like the AI Engine) to authenticate securely without holding an active browser session.
    *   **Header**: `Authorization: Bearer codorra_ai_engine_secret_2026`

---

##  System Workflow (Step-by-Step)

The unified data flow operates in five logical steps:

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Frontend as React Dashboard
    participant Backend as FastAPI Backend (Port 8000)
    participant AI as AI Engine (Port 8001)
    
    Admin->>Backend: 1. Register & Login User
    Admin->>Backend: 2. Register Camera (capacity=100)
    Admin->>AI: 3. Trigger stream processing (RTSP or File)
    loop Every Nth Frame
        AI->>AI: 4. YOLO Detects people & blurs faces
        AI->>Backend: 5. POST /api/detections/ (metrics)
        Note over AI,Backend: If Density > 85%, Auto-generates Alert!
    end
    Frontend->>Backend: 6. Fetch live heatmap & active alerts
```

---

##  1. FastAPI Backend API (`http://localhost:8000`)

###  Authentication Endpoints

#### Register User
*   **Endpoint**: `POST /api/auth/register`
*   **Payload**:
    ```json
    {
      "username": "operator_john",
      "email": "john@crowdshield.local",
      "password": "secure_password_123",
      "role": "admin"
    }
    ```

#### Login User (Generates Cookie)
*   **Endpoint**: `POST /api/auth/login`
*   **Payload**:
    ```json
    {
      "username": "operator_john",
      "password": "secure_password_123"
    }
    ```

---

###  Camera Management Endpoints

#### Create Camera
*   **Endpoint**: `POST /api/cameras/`
*   **Headers**: `Authorization: Bearer codorra_ai_engine_secret_2026` (or Cookie)
*   **Payload**:
    ```json
    {
      "name": "Metro Station A - Platform 1",
      "location": "Downtown Metro",
      "latitude": 27.7172,
      "longitude": 85.3240,
      "stream_url": "rtsp://camera.local/stream1",
      "capacity": 150,
      "status": "active",
      "description": "Main platform camera"
    }
    ```
*   **Response**: `{"success": true, "camera_id": "6a19834cf0f0ece547290126"}`

#### List Cameras
*   **Endpoint**: `GET /api/cameras`

---

###  Detection Telemetry Endpoints (From AI Engine)

#### Log Density Telemetry
*   **Endpoint**: `POST /api/detections/`
*   **Headers**: `Authorization: Bearer codorra_ai_engine_secret_2026`
*   **Payload**:
    ```json
    {
      "camera_id": "6a19834cf0f0ece547290126",
      "people_count": 130,
      "density_percentage": 86.6,
      "density_level": "critical",
      "risk_score": 0.87,
      "frame_data": {}
    }
    ```
*   **Behavior**: Saves details to `density_logs`. Because `density_level` is `"critical"`, an active alert is generated in the database automatically.

#### Get Live Detections (Latest telemetry per camera)
*   **Endpoint**: `GET /api/detections/live`

#### Get Camera History
*   **Endpoint**: `GET /api/detections/{camera_id}/history?limit=50`

---

###  Alert Management Endpoints

#### List Alerts (With Status and Severity Filters)
*   **Endpoint**: `GET /api/alerts/?status=active&severity=critical`

#### Acknowledge Alert (Operator marking in-progress)
*   **Endpoint**: `POST /api/alerts/{alert_id}/acknowledge`
*   **Payload**:
    ```json
    {
      "note": "Dispatching station staff to platform 1."
    }
    ```

#### Resolve Alert
*   **Endpoint**: `POST /api/alerts/{alert_id}/resolve`
*   **Payload**:
    ```json
    {
      "note": "Crowd size dispersed. Normal service resumed."
    }
    ```

---

###  Heatmap & Analytics Endpoints

#### Get Map Heatmap Points
*   **Endpoint**: `GET /api/heatmap/data?period_hours=1`
*   **Response**: Lists geographical coordinates, people count, and intensities (0.0 to 1.0) for active map rendering.

#### Get Temporal Chart Data
*   **Endpoint**: `GET /api/analytics/temporal?period_hours=24&granularity=hourly&camera_id=6a19834cf0f0ece547290126`
*   **Response**: High-resolution arrays for charts (avg/max density, count) grouped by hour.

---

###  Compliance & GDPR Privacy Endpoints

#### Run Automated Privacy Compliance Audit
*   **Endpoint**: `GET /api/privacy/compliance/verify`
*   **Response**: Verifies data classification compliance, anonymization logs, and retention status.

#### Trigger Right to be Forgotten (User Data Deletion Request)
*   **Endpoint**: `POST /api/privacy/data/deletion?reason=User requested opt-out`

---

##  2. AI Engine API (`http://localhost:8001`)

Exposes computer vision inference nodes to initialize pipelines, process mock media files, or trigger streaming ingestion.

###  Frame Inference Node
*   **Endpoint**: `POST /api/process-frame?camera_id=6a19834cf0f0ece547290126`
*   **Content-Type**: `multipart/form-data`
*   **Form Param**: `file` (Image upload)
*   **Execution Flow**:
    1.  Downloads YOLO model (on first boot).
    2.  Locates coordinates of people using YOLOv8 bounding boxes.
    3.  Crops bounding boxes and applies a Gaussian blur to all faces (privacy mask).
    4.  POSTs metrics directly to Backend `POST /api/detections/` using API Key.
    5.  Returns anonymized frame results back to caller.

###  Video File Processor Ingestion
*   **Endpoint**: `POST /api/process-video?camera_id=6a19834cf0f0ece547290126`
*   **Content-Type**: `multipart/form-data`
*   **Form Param**: `file` (Video upload)
*   **Response**: Starts background processing thread and returns ingestion job status.

###  Stream Orchestration (RTSP / Continuous Stream)
*   **Endpoint**: `POST /api/stream?camera_id=6a19834cf0f0ece547290126&stream_url=rtsp://localhost:8554/stream1`
*   **Behavior**: Spawns an asynchronous background stream processor that keeps reading camera feeds, processing frames continuously at interval intervals, and pushing metrics directly to backend telemetry APIs in real-time.
