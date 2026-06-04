# API

All API responses use a consistent envelope.

Success:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "string",
  "errorCode": "string",
  "details": []
}
```

## Auth

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Current profile | USER/ADMIN |

## Health

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/` | Basic API status response | Public |
| GET | `/healthz` | Render-ready health check endpoint | Public |

## Users

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Current user profile | USER/ADMIN |
| GET | `/api/admin/users` | List users | ADMIN |

## Subjects

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/subjects` | List subjects | USER/ADMIN |
| POST | `/api/admin/subjects` | Create subject | ADMIN |
| PUT | `/api/admin/subjects/{id}` | Update subject | ADMIN |
| DELETE | `/api/admin/subjects/{id}` | Delete subject | ADMIN |

## Submissions

| Method | Path | Description | Auth | Ownership |
|---|---|---|---|---|
| POST | `/api/submissions` | Upload homework image | USER/ADMIN | Current user |
| GET | `/api/submissions/me` | List own submissions | USER/ADMIN | Own only |
| GET | `/api/submissions/{id}` | View own submission | USER/ADMIN | USER own only |
| DELETE | `/api/submissions/{id}` | Delete own submission | USER/ADMIN | USER own only |
| GET | `/api/admin/submissions` | List all submissions | ADMIN | Any |
| GET | `/api/admin/submissions/{id}` | View any submission | ADMIN | Any |

## AI

| Method | Path | Description | Auth | Ownership |
|---|---|---|---|---|
| POST | `/api/submissions/{id}/explain` | Generate explanation | USER/ADMIN | USER own only |
| POST | `/api/submissions/{id}/grade` | Grade answer | USER/ADMIN | USER own only |
| POST | `/api/submissions/{id}/grade-image` | Grade answer from uploaded image | USER/ADMIN | USER own only |
| POST | `/api/gradings/image` | Grade a new image containing both question and student work | USER/ADMIN | Current user |

Grading request:

```json
{
  "userAnswer": "My answer is..."
}
```

Grade new work from image uses `multipart/form-data`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `subjectId` | number | Yes | Subject used to guide AI grading |
| `note` | string | No | Optional grading note or rubric |
| `image` | file | Yes | JPG, PNG, or WebP image containing the question and student work |

## AI Usage

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/ai-usage/me` | Current user's daily explanation quota | USER/ADMIN |
| GET | `/api/admin/ai-usage-logs` | List AI usage logs | ADMIN |

Quota response:

```json
{
  "dailyLimit": 10,
  "usedToday": 3,
  "remainingToday": 7,
  "resetAt": "2026-06-05T00:00:00Z"
}
```
