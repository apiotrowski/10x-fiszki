import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { validTestUser, invalidTestUser, invalidEmailUser, emptyPasswordUser } from "../fixtures/test-users";

test.describe("Login Flow (with Page Object Model)", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Arrange: Initialize Page Object and navigate to login page
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form with all required elements", async () => {
    // Assert: Verify all form elements are present
    await loginPage.expectFormToBeVisible();
    await expect(loginPage.submitButton).toHaveText("Zaloguj się");
  });

  test("should successfully login with valid credentials", async () => {
    // Act: Login with valid credentials
    await loginPage.loginWithUser(validTestUser);

    // Assert: Verify redirect to decks page
    await loginPage.expectSuccessfulLogin();
  });

  test("should show error message with invalid credentials", async () => {
    // Act: Login with invalid credentials
    await loginPage.loginWithUser(invalidTestUser);

    // Assert: Verify error message is displayed
    await loginPage.expectSubmitError();
  });

  test("should show validation error for invalid email format", async () => {
    // Act: Submit form with invalid email format
    await loginPage.loginWithUser(invalidEmailUser);

    // Assert: Verify email validation error is displayed
    await loginPage.expectEmailError("Wprowadź poprawny adres email");
  });

  test("should show validation error for empty email", async () => {
    // Act: Submit form with only password filled
    await loginPage.fillCredentials("", validTestUser.password);
    await loginPage.submit();

    // Assert: Verify email validation error is displayed
    await loginPage.expectEmailError("Adres email jest wymagany");
  });

  test("should show validation error for empty password", async () => {
    // Act: Submit form with only email filled
    await loginPage.fillCredentialsFromUser(emptyPasswordUser);
    await loginPage.submit();

    // Assert: Verify password validation error is displayed
    await loginPage.expectPasswordError("Hasło jest wymagane");
  });

  test("should clear validation errors when user starts typing", async () => {
    // Act: Submit empty form to trigger validation errors
    await loginPage.fillCredentials("", "");
    await loginPage.submit();

    // Assert: Verify validation errors are displayed
    await loginPage.expectEmailError();
    await loginPage.expectPasswordError();

    // Act: Start typing in email field
    await loginPage.emailInput.fill("test");

    // Assert: Verify email error is cleared
    await loginPage.expectNoEmailError();

    // Act: Start typing in password field
    await loginPage.passwordInput.fill("pass");

    // Assert: Verify password error is cleared
    await loginPage.expectNoPasswordError();
  });

  // OPTION 1: Use page.waitForResponse() to wait for the API call
  // This is the most reliable approach - it waits for the actual response
  test("should disable form inputs and button while submitting - OPTION 1", async ({ page }) => {
    // Arrange: Fill in the form
    await loginPage.fillCredentialsFromUser(validTestUser);

    // Arrange: Intercept the API call to delay response
    await page.route("/api/auth/login", async (route) => {
      // Delay the response by 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Act: Submit the form and wait for the API response
    const responsePromise = page.waitForResponse("/api/auth/login");
    await loginPage.submit();

    // Assert: Verify loading state immediately after submit
    await loginPage.expectLoadingState();

    // Wait for the response to complete
    await responsePromise;
  });

  test("should have accessible form elements", async () => {
    // Assert: Verify ARIA attributes
    await loginPage.expectAccessibleForm();
  });

  test("should navigate to registration page when clicking register link", async ({ page }) => {
    // Act: Click the registration link
    await loginPage.goToRegister();

    // Assert: Verify navigation to registration page
    await expect(page).toHaveURL("/auth/register");
  });

  test("should navigate to password reset page when clicking forgot password link", async ({ page }) => {
    // Act: Click the forgot password link
    await loginPage.goToForgotPassword();

    // Assert: Verify navigation to password reset page
    await expect(page).toHaveURL("/auth/reset-password");
  });
});
