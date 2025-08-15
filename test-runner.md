# Testing Setup Instructions

## Install Testing Dependencies

Run the following command to install the required testing dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

## Run Tests

After installing dependencies, you can run tests using:

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

## Test Coverage

The authentication system includes comprehensive unit tests for:

### AuthService Tests

- ✅ Successful login with valid credentials for all family members
- ✅ Error handling for invalid credentials
- ✅ Session management (create, retrieve, expire)
- ✅ Logout functionality
- ✅ Session timeout detection
- ✅ Session refresh capability
- ✅ Time remaining calculations

### AuthContext Tests

- ✅ Initial state management
- ✅ User loading on mount
- ✅ Login flow with success and error handling
- ✅ Logout functionality
- ✅ Session refresh
- ✅ Error clearing
- ✅ Provider requirement validation

## Test Files Location

- `src/services/__tests__/AuthService.test.ts` - AuthService unit tests
- `src/contexts/__tests__/AuthContext.test.tsx` - AuthContext unit tests
- `src/test/setup.ts` - Test environment setup
- `vitest.config.ts` - Vitest configuration

## Test Features

- **Mocked localStorage**: Tests run with mocked localStorage to avoid side effects
- **Async testing**: Proper handling of async operations like login
- **Error scenarios**: Comprehensive error handling tests
- **Session management**: Tests for session expiration and refresh
- **React component testing**: Context provider and hook testing
