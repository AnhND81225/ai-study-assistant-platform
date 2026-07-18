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
| GET | `/api/submissions/me` | List, search, and filter own submissions | USER/ADMIN | Own only |
| GET | `/api/submissions/{id}` | View own submission | USER/ADMIN | USER own only |
| PATCH | `/api/submissions/{id}` | Update title, note, or favorite flag | USER/ADMIN | USER own only |
| DELETE | `/api/submissions/{id}` | Delete own submission | USER/ADMIN | USER own only |
| GET | `/api/admin/submissions` | List all submissions | ADMIN | Any |
| GET | `/api/admin/submissions/{id}` | View any submission | ADMIN | Any |

Supported query parameters for `GET /api/submissions/me`:

| Parameter | Example | Description |
|---|---|---|
| `search` | `derivative` | Searches title, note, detected question, and original filename |
| `subjectId` | `1` | Filters by subject |
| `status` | `EXPLAINED` | Filters by submission status, including selection-required, incomplete-image, and partial-result states |
| `favorite` | `true` | Shows favorited submissions only |
| `page` / `size` | `0` / `8` | Pagination controls |
| `sort` | `createdAt,desc` | Sort order |

Submission update request:

```json
{
  "title": "Calculus homework 02",
  "note": "Review chain rule mistakes",
  "favorite": true
}
```

## AI

| Method | Path | Description | Auth | Ownership |
|---|---|---|---|---|
| POST | `/api/submissions/{id}/explain` | Generate explanation | USER/ADMIN | USER own only |
| POST | `/api/submissions/{id}/questions/solve` | Solve up to three detected questions | USER/ADMIN | USER own only |
| POST | `/api/submissions/{id}/grade` | Grade answer | USER/ADMIN | USER own only |
| POST | `/api/submissions/{id}/grade-image` | Grade answer from uploaded image | USER/ADMIN | USER own only |
| POST | `/api/gradings/image` | Grade a new image containing both question and student work | USER/ADMIN | Current user |

`POST /api/submissions/{id}/explain` supports optional query parameters:

| Parameter | Example | Description |
|---|---|---|
| `questionNumber` | `5` | Question to solve when the image contains several numbered questions |
| `solveMode` | `ONE_QUESTION` | `AUTO`, `ONE_QUESTION`, `ANSWERS_ONLY`, or `EXPLAIN_ALL` |

When an image contains multiple questions and no scope is supplied, the API stores a `QUESTION_SELECTION_REQUIRED` scan instead of pretending that a solution is ready. The response includes `questionType`, `resultStatus`, and `availableQuestions`.

Solve selected questions:

```json
{
  "questionNumbers": [2, 5, 7]
}
```

The request accepts one to three detected question numbers. Each new question costs one daily solve credit. Previously saved question solutions are returned from the database and do not consume another credit.

Grading request:

```json
{
  "userAnswer": "My answer is...",
  "questionSolutionId": 42
}
```

`questionSolutionId` is optional for legacy single-question submissions and required by the UI when a multi-question submission has saved per-question solutions. Image grading accepts the same optional field as multipart form data.

Grade new work from image uses `multipart/form-data`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `subjectId` | number | Yes | Subject used to guide AI grading |
| `note` | string | No | Optional grading note or rubric |
| `image` | file | Yes | JPG, PNG, or WebP image containing the question and student work |

The uploaded image is the primary source of truth. An unrelated note is ignored and may produce an `inputWarning` in the saved AI explanation. If the image and note conflict so strongly that the task cannot be determined, the API returns `AI_INPUT_CONFLICT`.

AI response validation errors:

| Error code | Meaning |
|---|---|
| `AI_RESPONSE_TRUNCATED` | The provider stopped because the generated answer exceeded its output limit |
| `AI_RESPONSE_PARSE_ERROR` | The provider response did not match the expected structured fields |
| `AI_INPUT_CONFLICT` | The image and note conflict and the primary task cannot be determined reliably |

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

Multi-question detection is logged as a zero-credit `SCAN`, with a separate daily scan cap to protect provider cost. Successful solves consume one credit per newly generated question, not per HTTP request.
