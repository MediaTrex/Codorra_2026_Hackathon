## APIs

### Root APIs

```
GET /api/ — API status and version.
GET /api/docs — API documentation (Swagger/OpenAPI).
GET /api/health — health check endpoint.
```


### Auth APIs

```
POST /api/auth/register — register user. Body: username, email, password, role (admin/standard). Returns user_id.
POST /api/auth/login — login user. Body: username, password. Returns Cookies: auth_token.
POST /api/auth/logout — invalidate cookie (optional, can also rely on expiration).
GET /api/auth/me — get current user info (requires auth).
```


### Camera APIs

```
POST /api/cameras — create camera. Body: name, location, latitude, longitude, stream_url, capacity, description. Returns camera_id.
GET /api/cameras — list cameras.
GET /api/cameras/{id} — camera details.
PUT /api/cameras/{id} — update fields (same as create, optional).
DELETE /api/cameras/{id} — remove camera.

Stores in collection: cameras.
```


### Detection APIs

```
POST /api/detections — log detection from AI. Body: camera_id, people_count, density_percentage, density_level (low|medium|high|critical), risk_score, optional frame_data. Creates density_logs entry; generates alert (alerts collection) if high/critical.
GET /api/detections/live — latest per camera.
GET /api/detections/{camera_id}/history?limit=
GET /api/detections/{camera_id}/trends?hours=
Responses: JSON with success, data, ids, totals.
```