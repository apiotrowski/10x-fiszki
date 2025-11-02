# Testing Guide

This project uses **Vitest** for unit testing and **Playwright** for E2E testing.

## Unit Testing with Vitest

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Unit Tests

Unit tests are located in `__tests__` directories next to the code they test:
- `src/lib/__tests__/` - for utility functions and services
- `src/components/__tests__/` - for React components

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component/Function Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Key Features

- **Globals enabled**: Use `describe`, `it`, `expect` without imports
- **jsdom environment**: Full DOM testing support
- **React Testing Library**: Test components like users interact with them
- **Mock functions**: Use `vi.fn()`, `vi.spyOn()`, `vi.mock()`
- **Setup file**: Global test configuration in `src/test/setup.ts`

## E2E Testing with Playwright

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (visual test runner)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

### Writing E2E Tests

E2E tests are located in the `e2e/` directory at the project root.

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform user action', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Interact with elements
    await page.click('button[type="submit"]');
    
    // Assert results
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Key Features

- **Chromium browser**: Tests run in Desktop Chrome
- **Auto-start dev server**: Server starts automatically before tests
- **Trace on retry**: Debugging traces captured on test failures
- **Screenshots**: Automatic screenshots on failure
- **Page Object Model**: Recommended for maintainable tests

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**: Focus on what the code does, not how
2. **Use descriptive test names**: `it('should validate email format')`
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Mock external dependencies**: Use `vi.mock()` for API calls, etc.
5. **Test edge cases**: Empty inputs, null values, errors

### E2E Tests

1. **Test critical user flows**: Authentication, core features
2. **Use semantic locators**: `getByRole`, `getByLabel` over CSS selectors
3. **Wait for elements**: Use `waitForLoadState`, `waitForSelector`
4. **Isolate tests**: Each test should be independent
5. **Use Page Object Model**: Organize selectors and actions

## Configuration Files

- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `src/test/setup.ts` - Global test setup for Vitest

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
npm run test:coverage
```

Open `coverage/index.html` in a browser to view the detailed report.

## Debugging

### Vitest
- Use `test.only()` to run a single test
- Use `test.skip()` to skip a test
- Add `debugger` statements in your code
- Use VS Code debugger with Vitest extension

### Playwright
- Use `--debug` flag to step through tests
- Use `--ui` flag for visual debugging
- View traces in Playwright Trace Viewer
- Use `page.pause()` to pause execution

## CI/CD Integration

Tests are configured to run optimally in CI environments:
- Vitest runs in parallel by default
- Playwright retries failed tests twice on CI
- Coverage reports can be uploaded to coverage services

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)

