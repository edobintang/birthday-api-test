# Birthday Reminder Service

Backend API and worker that store users and send birthday messages at 9 AM in each user's local timezone.

## Requirements
- Node.js 18+
- Docker (optional)

## Quick Start (Docker)
1. `docker compose up --build`
2. API runs at `http://localhost:3000`

## Local Development
1. Install dependencies: `npm install`
2. Start MongoDB locally or use Docker for MongoDB.
3. Create an `.env` file based on `.env.example`.
4. Start API: `npm run dev`
5. Start worker: `npm run worker`

## API Examples
### Create User
`POST /users`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "birthday": "1990-05-10",
  "timezone": "America/New_York"
}
```

### Get Users
`GET /users`

### Get User By ID
`GET /users/{id}`

### Update User
`PUT /users/{id}`
```json
{
  "timezone": "Europe/London"
}
```

### Delete User
`DELETE /users/{id}`

## Worker Notes
- The worker runs every minute and sends messages when the user's local time is exactly 09:00.
- A `lastNotifiedYear` field prevents duplicate sends within the same year.

## Tests
- Run `npm test`

## Assumptions and Limitations
- Birthday is stored as a date-only string in ISO 8601 `YYYY-MM-DD`.
- The worker runs once per minute; if the container is paused or down at 9 AM local time, that birthday message could be missed.
- Email delivery is simulated with a console log.
