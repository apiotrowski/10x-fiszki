import { test, expect } from "@playwright/test";
import { validTestUser, invalidTestUser, invalidEmailUser, emptyPasswordUser } from "../fixtures/test-users";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Arrange: Navigate to login page before each test
    await page.goto("/auth/login");
  });

  test("should display login form with all required elements", async ({ page }) => {
    // Assert: Verify all form elements are present
    await expect(page.locator('[data-test-id="login-page"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-form-card"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-email-input"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-password-input"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-submit-button"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-submit-button"]')).toHaveText("Zaloguj się");
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in the form with valid credentials
    await emailInput.fill(validTestUser.email);
    await passwordInput.fill(validTestUser.password);

    // Assert: Verify form inputs have correct values
    await expect(emailInput).toHaveValue(validTestUser.email);
    await expect(passwordInput).toHaveValue(validTestUser.password);

    await page.waitForTimeout(5000);
    // Act: Submit the form
    await submitButton.click();

    // Assert: Verify redirect to decks page
    await expect(page).toHaveURL("/decks");
  });

  test("should show error message with invalid credentials", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in the form with invalid credentials
    await emailInput.fill(invalidTestUser.email);
    await passwordInput.fill(invalidTestUser.password);

    // Act: Submit the form
    await submitButton.click();

    // Assert: Verify error message is displayed
    await expect(page.locator('[data-test-id="login-submit-error"]')).toBeVisible();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in the form with invalid email format
    await emailInput.fill(invalidEmailUser.email);
    await passwordInput.fill(invalidEmailUser.password);

    // Act: Submit the form
    await submitButton.click();

    // Assert: Verify email validation error is displayed
    await expect(page.locator('[data-test-id="login-email-error"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-email-error"]')).toContainText("Wprowadź poprawny adres email");
  });

  test("should show validation error for empty email", async ({ page }) => {
    // Arrange: Get form elements
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in only password, leave email empty
    await passwordInput.fill(validTestUser.password);

    // Act: Submit the form
    await submitButton.click();

    // Assert: Verify email validation error is displayed
    await expect(page.locator('[data-test-id="login-email-error"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-email-error"]')).toContainText("Adres email jest wymagany");
  });

  test("should show validation error for empty password", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in only email, leave password empty
    await emailInput.fill(emptyPasswordUser.email);

    // Act: Submit the form
    await submitButton.click();

    // Assert: Verify password validation error is displayed
    await expect(page.locator('[data-test-id="login-password-error"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-password-error"]')).toContainText("Hasło jest wymagane");
  });

  test("should clear validation errors when user starts typing", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Submit empty form to trigger validation errors
    await submitButton.click();

    // Assert: Verify validation errors are displayed
    await expect(page.locator('[data-test-id="login-email-error"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-password-error"]')).toBeVisible();

    // Act: Start typing in email field
    await emailInput.fill("test");

    // Assert: Verify email error is cleared
    await expect(page.locator('[data-test-id="login-email-error"]')).not.toBeVisible();

    // Act: Start typing in password field
    await passwordInput.fill("pass");

    // Assert: Verify password error is cleared
    await expect(page.locator('[data-test-id="login-password-error"]')).not.toBeVisible();
  });

  test("should disable form inputs and button while submitting", async ({ page }) => {
    // Arrange: Get form elements
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');
    const submitButton = page.locator('[data-test-id="login-submit-button"]');

    // Act: Fill in the form
    await emailInput.fill(validTestUser.email);
    await passwordInput.fill(validTestUser.password);

    // Act: Intercept the API call to delay response
    await page.route("/api/auth/login", async (route) => {
      // Delay the response to check loading state
      await page.waitForTimeout(1000);
      await route.continue();
    });

    // Act: Submit the form
    const submitPromise = submitButton.click();

    // Assert: Verify button shows loading state
    await expect(submitButton).toContainText("Logowanie...");
    await expect(submitButton).toBeDisabled();
    await expect(emailInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();

    // Wait for submission to complete
    await submitPromise;
  });

  test("should have accessible form elements", async ({ page }) => {
    // Assert: Verify ARIA attributes
    const emailInput = page.locator('[data-test-id="login-email-input"]');
    const passwordInput = page.locator('[data-test-id="login-password-input"]');

    await expect(emailInput).toHaveAttribute("aria-required", "true");
    await expect(passwordInput).toHaveAttribute("aria-required", "true");
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(emailInput).toHaveAttribute("autocomplete", "email");
    await expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });

  test("should navigate to registration page when clicking register link", async ({ page }) => {
    // Arrange: Find the registration link
    const registerLink = page.getByRole("link", { name: "Zarejestruj się" });

    // Assert: Verify link is visible
    await expect(registerLink).toBeVisible();

    // Act: Click the registration link
    await registerLink.click();

    // Assert: Verify navigation to registration page
    await expect(page).toHaveURL("/auth/register");
  });

  test("should navigate to password reset page when clicking forgot password link", async ({ page }) => {
    // Arrange: Find the forgot password link
    const forgotPasswordLink = page.getByRole("link", { name: "Nie pamiętasz hasła?" });

    // Assert: Verify link is visible
    await expect(forgotPasswordLink).toBeVisible();

    // Act: Click the forgot password link
    await forgotPasswordLink.click();

    // Assert: Verify navigation to password reset page
    await expect(page).toHaveURL("/auth/reset-password");
  });
});
