# URL Shortener Backend

Backend API for the URL Shortener application developed with Express.js, TypeScript, PostgreSQL, Redis and TypeORM.

## Project Structure

The project follows a modular architecture:

- `src/controllers/`: Business logic for handling requests
- `src/entities/`: TypeORM entities defining the database schema
- `src/middleware/`: Express middleware for authentication, validation, etc.
- `src/routes/`: Express routes defining API endpoints
- `src/config/`: Configuration files for databases, environment, etc.
- `src/utils/`: Utility functions and helpers
- `src/tests/`: Test files organized by type (unit, integration)

## Testing

Tests are implemented using Jest and Supertest. There are two types of tests:

1. **Unit Tests**: Test individual components in isolation

   - Located in `src/tests/unit/`
   - Mock external dependencies

2. **Integration Tests**: Test the interaction between components
   - Located in `src/tests/integration/`
   - Optional database connection for full integration tests

### Running Tests

To run the tests:

```bash
# Run all tests
yarn test

# Run with coverage report
yarn test:coverage

# Run tests in watch mode during development
yarn test:watch

# Run tests in Docker
./run-tests.sh --docker
```

## Test Status

Currently, the tests need some adjustments to properly mock the TypeORM repository methods. The controllers use `findOneBy` method, but our mocks don't correctly simulate this behavior. This is a known issue that will be fixed in future updates.

## Development

To run the application in development mode:

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## Docker

The application can be run in Docker:

```bash
# Build and start with docker-compose
docker-compose up

# Build and start only the backend
docker-compose up backend
```
