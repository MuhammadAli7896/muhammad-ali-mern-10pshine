# Frontend Testing Guide

This document provides information about the test suite for the Notes Application frontend.

## Testing Stack

- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM

## Running Tests

### Run all tests in watch mode
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

### Test Files Location
- Page tests: `src/pages/*.test.tsx`
- Component tests: `src/components/*.test.tsx`
- Context tests: `src/context/*.test.tsx`
- Utility tests: `src/lib/*.test.ts`

### Test Utilities
- `src/test/setup.ts`: Global test setup and configuration
- `src/test/test-utils.tsx`: Custom render function with providers
- `src/test/mockData.ts`: Mock data for testing

## Test Coverage

### Authentication & Authorization
- ✅ Login page (`Login.test.tsx`)
  - Form validation (email, password)
  - Successful login flow
  - Error handling
  - Password visibility toggle
  - Navigation to signup
  - Forgot password functionality

- ✅ Signup page (`Signup.test.tsx`)
  - Form validation (name, email, password)
  - Successful signup flow
  - Error handling (email exists, etc.)
  - Password strength validation
  - Navigation to login

- ✅ Auth Context (`AuthContext.test.tsx`)
  - User login/logout
  - Session persistence
  - Token management
  - Error handling
  - Profile updates

### Notes Management
- ✅ Notes page (`Notes.test.tsx`)
  - Display notes list
  - Create new note
  - Edit existing note
  - Delete note
  - Pin/unpin notes
  - Search functionality
  - Filter by tags
  - Filter by view (all/pinned/archived)
  - Empty state
  - Loading state
  - Error handling

### Components
- ✅ SearchBar (`SearchBar.test.tsx`)
  - Search input with debounce
  - Tag filtering
  - View filtering
  - Clear search

- ✅ UserProfileModal (`UserProfileModal.test.tsx`)
  - Username update
  - Password change with email verification
  - Form validation
  - Tab switching
  - Modal open/close

### API & Token Management
- ✅ API Client (`apiClient.test.ts`)
  - Access token injection
  - Token refresh on 401
  - Refresh token exclusions (login/signup)
  - Token storage
  - Error handling
  - Retry logic

## Writing New Tests

### Basic Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/some text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
```

### API Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: {
    method: vi.fn(),
  },
}));

describe('API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls API correctly', async () => {
    const mockData = { success: true };
    (api.method as any).mockResolvedValue(mockData);
    
    const result = await someFunction();
    
    expect(api.method).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(mockData);
  });
});
```

## Best Practices

1. **Use Testing Library queries in this order:**
   - `getByRole` (most accessible)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByTestId` (last resort)

2. **User Events:**
   - Always use `userEvent.setup()` at the start of tests
   - Prefer `userEvent` over `fireEvent` for realistic interactions

3. **Async Testing:**
   - Use `waitFor` for async assertions
   - Use `findBy` queries for elements that appear asynchronously

4. **Mocking:**
   - Clear mocks in `beforeEach`
   - Mock only what's necessary
   - Use mock data from `mockData.ts` for consistency

5. **Test Organization:**
   - Group related tests with `describe`
   - Use descriptive test names starting with "it"
   - Keep tests isolated and independent

6. **Coverage Goals:**
   - Aim for 80%+ code coverage
   - Focus on critical user flows
   - Don't test implementation details

## Continuous Integration

Tests should pass before merging:
```bash
npm run test:run && npm run lint
```

## Troubleshooting

### Tests timing out
- Increase timeout in `vitest.config.ts`
- Check for missing `await` statements
- Verify mocks are properly configured

### Can't find element
- Use `screen.debug()` to see current DOM
- Check if element appears asynchronously (use `findBy`)
- Verify correct query selector

### Mock not working
- Ensure mock is defined before import
- Use `vi.clearAllMocks()` in `beforeEach`
- Check mock path matches actual module path

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
