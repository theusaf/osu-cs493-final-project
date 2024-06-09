# Tarpaulin

Spring 2024, CS 494 Final Project

## Environment Setup

This project requires an `.env.local` file or environment variables to be set.

- `FIREBASE_CREDENTIALS` - The JSON string of the Firebase admin credentials
- `JWT_SECRET` - The secret key for JWT token generation

## Running the Project

To run the project, use Docker Compose:

```bash
docker compose up
```

## Testing

Project tests require the project to be running. Run the tests with:

```bash
npm test
```
