# Birthday Reminder Service

A service that manages user data and sends birthday reminders at 9 AM in users' local timezones.

> **Disclaimer**: This project is closed to only Afief (Author) and HubbedIn for Take Home Test. This project is not "blind helped" by AI, meaning that I take responsibility for every single line of code presented in this project. This project is meant to be run locally. If it's to be hosted, it would require further configuration and documentation update.

---

## Features

- User Management (Create, Retrieve, Update, Delete)
- Birthday Messaging Worker
- Input Validation
- Timezone-aware message delivery
- Simulated time support for testing

---

## Prerequisites

- Docker and Docker Compose

---

## Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/afiefsky/birthday-reminder.git
   cd birthday-reminder
   ```

2. Create a `.env` file in the root directory if it doesn't exist:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://mongodb:27017/birthday-reminder
   ```

---

## Running the Application

The application runs in a Docker container alongside MongoDB:

```bash
docker-compose up
```

This starts both the API and MongoDB containers. All dependencies are automatically installed inside the container.

---

## Unit Testing

Tests are located in the `test` directory, organized by unit:

```bash
npm install
npm test -- --verbose
```

Example output:
```
PASS test/unit/services/user.service.test.js
  ✓ should create a user with valid data
  ✓ should validate email and timezone
  ✓ should retrieve user by ID
  ✓ should update user details
  ✓ should delete user

PASS test/unit/workers/birthday.worker.test.js
  ✓ sends birthday message at correct time
  ✓ does not send birthday message if not 9 AM or not birthday
```

> The unit tests are designed to cover realistic and edge case scenarios.

---

## Testing Birthday Worker with Simulated Time

To test the birthday system instantly without waiting for the actual time, you can simulate a specific datetime:

```bash
# Format: YYYY-MM-DDThh:mm:ss±hh:mm

# Example for UTC-4 (New York time):
SIMULATED_TIME="2024-05-30T09:00:00-04:00" docker-compose up

# Example for UTC+7 (Jakarta time):
SIMULATED_TIME="2024-05-30T09:00:00+07:00" docker-compose up
```

> If `SIMULATED_TIME` is not set, the application uses real current time.

---

## API Endpoints

### `POST /api/users` — Create a user

Request:
```json
{
  "name": "Robert Wilford",
  "email": "robertwilford@mail.com",
  "birthday": "1991-01-21",
  "timezone": "Asia/Jakarta"
}
```

Response (201 Created):
```json
{
    "name": "Robert Wilford",
    "email": "robertwilford@mail.com",
    "birthday": "1991-01-21T00:00:00.000Z",
    "timezone": "Asia/Jakarta",
    "_id": "683948a3a079126a2e0a1e13",
    "createdAt": "2025-05-30T05:56:51.807Z",
    "updatedAt": "2025-05-30T05:56:51.807Z",
    "__v": 0
}
```

- Required: `name`, `email` (must be unique), `birthday` (ISO 8601), `timezone` (valid IANA)
- Returns: 201 Created

---

### `GET /api/users/:id` — Retrieve a user

Response (200 OK):
```json
{
    "_id": "683948a3a079126a2e0a1e13",
    "name": "Robert Wilford",
    "email": "robertwilford@mail.com",
    "birthday": "1991-01-21T00:00:00.000Z",
    "timezone": "Asia/Jakarta",
    "createdAt": "2025-05-30T05:56:51.807Z",
    "updatedAt": "2025-05-30T05:57:58.718Z",
    "__v": 0
}
```

- Returns 404 if not found

---

### `PUT /api/users/:id` — Update a user

Request:
```json
{
    "name": "Robert W.S.A",
    "email": "robertskyrocket21@mail.com",
    "birthday": "1990-02-14",
    "timezone": "Asia/Dubai"
}
```

Response (200 OK):
```json
{
    "_id": "683948a3a079126a2e0a1e13",
    "name": "Robert W.S.A",
    "email": "robertskyrocket21@mail.com",
    "birthday": "1990-02-14T00:00:00.000Z",
    "timezone": "Asia/Dubai",
    "createdAt": "2025-05-30T05:56:51.807Z",
    "updatedAt": "2025-05-30T06:05:19.440Z",
    "__v": 0
}
```

- Same validation as `POST`
- Returns 404 if not found

---

### `DELETE /api/users/:id` — Delete a user

Response (200 OK):
```json
{
    "message": "User deleted successfully"
}
```

- Returns 404 if not found

---

## Error Responses

```json
{
  "status": 400,
  "errors": ["Invalid email format", "Timezone not recognized"]
}
```

- `200` - OK  
- `201` - Created  
- `400` - Bad Request  
- `404` - Not Found  
- `500` - Internal Server Error  

---

## Design Decisions

1. **Express.js** – Simple and flexible web framework.
2. **Mongoose** – ODM for schema and MongoDB access.
3. **node-cron** – Scheduling for the worker.
4. **Docker Compose** – Easy local setup.
5. **Timezone** – Store in UTC, convert at runtime.
6. **Worker**:
   - Runs every minute
   - Sends message at 9 AM local time
   - Avoids duplicates
   - Supports simulated time for testing
7. **Code Flow**: `index.js` (+middleware) → routes → controllers → services → models
8. **Code Rules**:
   - Routes → only call controllers
   - Controllers → only call services
   - Services → contain business logic, can call models and third-party APIs
   - Models → contain data/domain logic only
   - Worker → same behaviour as controller, it must not call model directly, instead call services first

---

## Assumptions

- User timezone will remain relatively stable
- Message delivery via `console.log` is acceptable for this test
- In-memory deduplication of messages is sufficient for current scope

---

## Limitations

- Birthday check every minute may not scale
- Message only logged (no real email/SMS delivery)
- No authentication/authorization
- No rate limiting
- Message state is lost on restart (in-memory)

---

## Postman Collection

You can use the provided Postman Collection (v2.1) to test the API endpoints.

### Steps:

1. Open Postman.  
2. Click **Import** > **File**.  
3. Select the file `birthday-reminder.postman_collection.json` from the project root.  
4. After import, these requests are available:

- `POST /api/users`
- `GET /api/users/:_ID`
- `PUT /api/users/:_ID`
- `DELETE /api/users/:_ID`
- `GET /api/users` (extra)

---

## Future Improvements

- Real email/firebase notifications
- Authentication system (e.g., JWT)
- Rate limiting
- Circuit breaker in API, in case DB spike or fails
- Persistent message tracking (e.g., in MongoDB)
- Caching and performance tuning
- Advanced timezone edge case handling
- Delivery message status tracking (to check if a message has been sent)