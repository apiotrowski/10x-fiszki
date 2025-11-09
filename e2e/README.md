# E2E Tests - Playwright

## Struktura Katalogów

```
e2e/
├── fixtures/           # Dane testowe (użytkownicy, decks, itp.)
├── page-objects/       # Page Object Models dla stron
└── auth/              # Testy dla modułu autoryzacji
    ├── login.spec.ts
    └── login-with-pom.spec.ts
```

## Konwencje

### Nazewnictwo Plików
- Testy: `*.spec.ts`
- Page Objects: `{PageName}Page.ts`
- Fixtures: `test-{resource}.ts`

### Data-test-id
Wszystkie interaktywne elementy powinny mieć atrybut `data-test-id`:
- Format: `{feature}-{element}-{type}`
- Przykład: `login-email-input`, `login-submit-button`

### Struktura Testu (Arrange-Act-Assert)
```typescript
test("should do something", async ({ page }) => {
  // Arrange: przygotowanie środowiska
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Act: wykonanie akcji
  await loginPage.login("user@example.com", "password");

  // Assert: weryfikacja rezultatu
  await loginPage.expectSuccessfulLogin();
});
```

## Uruchamianie Testów

### Wszystkie testy
```bash
npm run test:e2e
```

### Konkretny plik
```bash
npx playwright test e2e/auth/login.spec.ts
```

### Konkretny test
```bash
npx playwright test -g "should successfully login"
```

### Tryb interaktywny (UI)
```bash
npx playwright test --ui
```

### Tryb debug
```bash
npx playwright test --debug
```

### Z raportem HTML
```bash
npx playwright test --reporter=html
npx playwright show-report
```

## Page Object Model

### Tworzenie Nowego POM

```typescript
import { Page, Locator } from "@playwright/test";

export class MyPage {
  readonly page: Page;
  readonly myButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myButton = page.getByTestId("my-button");
  }

  async goto() {
    await this.page.goto("/my-page");
  }

  async clickButton() {
    await this.myButton.click();
  }
}
```

### Używanie POM w Testach

```typescript
import { test } from "@playwright/test";
import { MyPage } from "../page-objects/MyPage";

test("my test", async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.clickButton();
});
```

## Fixtures

### Tworzenie Fixtures

```typescript
// e2e/fixtures/test-users.ts
export interface TestUser {
  email: string;
  password: string;
}

export const validUser: TestUser = {
  email: "test@example.com",
  password: "TestPassword123!",
};
```

### Używanie Fixtures

```typescript
import { validUser } from "../fixtures/test-users";

test("login test", async ({ page }) => {
  await loginPage.login(validUser.email, validUser.password);
});
```

## Best Practices

### 1. Używaj data-test-id
```typescript
// ✅ Dobre
await page.locator('[data-test-id="login-submit-button"]').click();

// ❌ Złe (zależne od CSS)
await page.locator(".btn-primary.submit").click();
```

### 2. Enkapsuluj logikę w POM
```typescript
// ✅ Dobre
await loginPage.login(email, password);

// ❌ Złe (duplikacja logiki)
await page.getByTestId("email").fill(email);
await page.getByTestId("password").fill(password);
await page.getByTestId("submit").click();
```

### 3. Używaj Arrange-Act-Assert
```typescript
test("example", async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Act
  await loginPage.submit();

  // Assert
  await loginPage.expectError();
});
```

### 4. Testuj dostępność
```typescript
await expect(input).toHaveAttribute("aria-required", "true");
await expect(input).toHaveAttribute("aria-label", "Email");
```

### 5. Testuj stany ładowania
```typescript
await page.route("/api/*", async (route) => {
  await page.waitForTimeout(1000);
  await route.continue();
});

await submitButton.click();
await expect(submitButton).toBeDisabled();
```

## Debugowanie

### Playwright Inspector
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshots
```typescript
await page.screenshot({ path: "screenshot.png" });
```

### Video Recording
W `playwright.config.ts`:
```typescript
use: {
  video: "on-first-retry",
}
```

## Dokumentacja

Szczegółowa dokumentacja testów znajduje się w:
- `/docs/testing/login-e2e-tests.md` - Testy logowania
- `/docs/test-plan.md` - Ogólny plan testów

## Przydatne Linki

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Selectors](https://playwright.dev/docs/selectors)

