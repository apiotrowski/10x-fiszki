# Testing Quick Reference

## Vitest Cheat Sheet

### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(value).toBe(expected);
  });
});
```

### Common Matchers
```typescript
expect(value).toBe(5)                    // Strict equality
expect(value).toEqual({ a: 1 })          // Deep equality
expect(value).toBeTruthy()               // Truthy check
expect(value).toBeNull()                 // Null check
expect(value).toContain('text')          // String/array contains
expect(fn).toThrow()                     // Function throws error
```

### Mocking Functions
```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();                  // Create mock
mockFn.mockReturnValue(42);              // Set return value
mockFn.mockResolvedValue(data);          // Async return
expect(mockFn).toHaveBeenCalled();       // Called check
expect(mockFn).toHaveBeenCalledWith(arg);// Called with arg
```

### Spying on Functions
```typescript
const spy = vi.spyOn(object, 'method');
spy.mockImplementation(() => 'mocked');
spy.mockRestore();                       // Restore original
```

### Testing React Components
```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

const { container } = render(<Component />);
const button = screen.getByRole('button');
const input = screen.getByLabelText('Email');
const text = screen.getByText(/hello/i);

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'test@example.com');
```

### Async Testing
```typescript
it('should handle async', async () => {
  const result = await asyncFunction();
  expect(result).toBe('done');
});

it('should wait for element', async () => {
  render(<Component />);
  const element = await screen.findByText('Loaded');
  expect(element).toBeInTheDocument();
});
```

## Playwright Cheat Sheet

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('test name', async ({ page }) => {
  await page.goto('/');
  // test code
});
```

### Navigation
```typescript
await page.goto('/path');
await page.goBack();
await page.goForward();
await page.reload();
```

### Locators (Preferred)
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByText('Welcome')
page.getByLabel('Email')
page.getByPlaceholder('Enter email')
page.getByTestId('submit-button')
page.locator('.css-selector')
```

### Interactions
```typescript
await page.click('button');
await page.fill('input[name="email"]', 'test@example.com');
await page.check('input[type="checkbox"]');
await page.selectOption('select', 'value');
await page.press('input', 'Enter');
```

### Assertions
```typescript
await expect(page).toHaveTitle(/Title/);
await expect(page).toHaveURL(/path/);
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toContainText('text');
await expect(locator).toHaveValue('value');
await expect(locator).toHaveCount(3);
```

### Waiting
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('.element');
await page.waitForTimeout(1000);
await page.waitForURL('**/path');
```

### Screenshots & Videos
```typescript
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ fullPage: true });
```

### Test Hooks
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // cleanup
});
```

### Test Organization
```typescript
test.describe('Feature', () => {
  test('scenario 1', async ({ page }) => {});
  test('scenario 2', async ({ page }) => {});
});

test.describe.only('Focus on this', () => {});
test.skip('Skip this test', async ({ page }) => {});
```

## Common Patterns

### Testing Forms
```typescript
// Vitest
const user = userEvent.setup();
await user.type(screen.getByLabelText('Email'), 'test@example.com');
await user.click(screen.getByRole('button', { name: 'Submit' }));

// Playwright
await page.fill('input[name="email"]', 'test@example.com');
await page.click('button[type="submit"]');
```

### Testing API Calls
```typescript
// Vitest - Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);

// Playwright - Intercept requests
await page.route('**/api/**', route => {
  route.fulfill({ json: { data: 'mocked' } });
});
```

### Testing Authentication
```typescript
// Playwright - Setup authenticated state
test.use({
  storageState: 'auth.json'
});

test('authenticated test', async ({ page }) => {
  // Already logged in
});
```

## Running Tests

```bash
# Unit Tests
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:ui             # UI mode
npm run test:coverage       # With coverage

# E2E Tests
npm run test:e2e            # Run all
npm run test:e2e:ui         # UI mode
npm run test:e2e:debug      # Debug mode

# Run specific tests
npm test -- example.test.ts
npm run test:e2e -- example.spec.ts

# Run with filter
npm test -- -t "should validate"
```

## Debugging

### Vitest
```typescript
test.only('debug this', () => {});  // Run only this test
test.skip('skip this', () => {});   // Skip this test
```

### Playwright
```typescript
await page.pause();                 // Pause execution
```

```bash
npm run test:e2e:debug              # Debug mode
PWDEBUG=1 npm run test:e2e          # Alternative debug
```

## Tips

1. **Use semantic queries**: Prefer `getByRole`, `getByLabel` over CSS selectors
2. **Wait for elements**: Use `findBy*` or `waitFor*` for async content
3. **Test user behavior**: Test what users see and do, not implementation
4. **Keep tests isolated**: Each test should be independent
5. **Use Page Objects**: For E2E tests, create reusable page objects
6. **Mock external services**: Don't hit real APIs in tests
7. **Test error states**: Don't just test the happy path

