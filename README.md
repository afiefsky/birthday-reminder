# Birthday Reminder Service

A service that manages user data and sends birthday reminders at 9 AM in users' local timezones.

> **Disclaimer**: This project is closed to only Afief and HubbedIn for Take Home Test. This project is not "blind helped" by AI, meaning that I take responsibility for every single line of code presented in this project. This project is meant to be run locally. If it's to be hosted, it would require further configuration and documentation update.

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

1. Extract `birthday-reminder.zip`, then enter its root path:
   ```bash
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

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "birthday": "1990-01-01T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

- Required: `name`, `email` (must be unique), `birthday` (ISO 8601), `timezone` (valid IANA)
- Returns: 201 Created

---

### `GET /api/users/:id` — Retrieve a user

- Returns 404 if not found

---

### `PUT /api/users/:id` — Update a user

- Same validation as `POST`
- Returns 404 if not found

---

### `DELETE /api/users/:id` — Delete a user

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

1. **Express.js** — Lightweight and flexible
2. **Mongoose** — ODM for clean schema definitions
3. **node-cron** — Simple scheduling for the worker
4. **Docker Compose** — Simplified local setup
5. **Timezone Handling** — Stored in UTC, converted on runtime
6. **Worker Behavior**:
   - Runs every minute
   - Sends message at exactly 9 AM local time
   - Avoids duplicate messages
   - Can run with simulated time for testing

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

## Future Improvements

- Real email/firebase notifications
- Authentication system (e.g., JWT)
- Rate limiting
- Circuit breaker in API, in case DB spike or fails
- Persistent message tracking (e.g., in MongoDB)
- Caching and performance tuning
- Advanced timezone edge case handling
- Delivery message status tracking (to check if a message has been sent)