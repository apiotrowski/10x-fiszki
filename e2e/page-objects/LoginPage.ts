import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import type { TestUser } from "../fixtures/test-users";

/**
 * Page Object Model for Login Page
 * Encapsulates all interactions with the login page
 */
export class LoginPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly formCard: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly submitError: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="login-page"]');
    this.formCard = page.locator('[data-testid="login-form-card"]');
    this.form = page.locator('[data-testid="login-form"]');
    this.emailInput = page.locator('[data-testid="login-email-input"]');
    this.passwordInput = page.locator('[data-testid="login-password-input"]');
    this.submitButton = page.locator('[data-testid="login-submit-button"]');
    this.emailError = page.locator('[data-testid="login-email-error"]');
    this.passwordError = page.locator('[data-testid="login-password-error"]');
    this.submitError = page.locator('[data-testid="login-submit-error"]');
    this.registerLink = page.getByRole("link", { name: "Zarejestruj się" });
    this.forgotPasswordLink = page.getByRole("link", { name: "Nie pamiętasz hasła?" });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/auth/login");
  }

  /**
   * Fill in login credentials
   */
  async fillCredentials(email: string, password: string) {
    // Clear inputs first to ensure clean state
    //await this.emailInput.clear();
    // await this.passwordInput.clear();

    // Type character by character to properly trigger onChange events
    await this.emailInput.pressSequentially(email, { delay: 50 });
    await this.passwordInput.pressSequentially(password, { delay: 50 });

    // Additional wait to ensure React's onChange handlers have completed
    await this.page.waitForTimeout(100);
  }

  /**
   * Fill in login credentials using TestUser object
   */
  async fillCredentialsFromUser(user: TestUser) {
    await this.fillCredentials(user.email, user.password);
  }

  /**
   * Submit the login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete login flow with provided credentials
   */
  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /**
   * Complete login flow using TestUser object
   */
  async loginWithUser(user: TestUser) {
    await this.fillCredentialsFromUser(user);
    await this.submit();
  }

  /**
   * Verify all form elements are visible
   */
  async expectFormToBeVisible() {
    await expect(this.pageContainer).toBeVisible();
    await expect(this.formCard).toBeVisible();
    await expect(this.form).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Verify email validation error is displayed
   */
  async expectEmailError(message?: string) {
    await expect(this.emailError).toBeVisible();
    if (message) {
      await expect(this.emailError).toContainText(message);
    }
  }

  /**
   * Verify password validation error is displayed
   */
  async expectPasswordError(message?: string) {
    await expect(this.passwordError).toBeVisible();
    if (message) {
      await expect(this.passwordError).toContainText(message);
    }
  }

  /**
   * Verify submit error is displayed
   */
  async expectSubmitError() {
    await expect(this.submitError).toBeVisible();
  }

  /**
   * Verify email error is not visible
   */
  async expectNoEmailError() {
    await expect(this.emailError).not.toBeVisible();
  }

  /**
   * Verify password error is not visible
   */
  async expectNoPasswordError() {
    await expect(this.passwordError).not.toBeVisible();
  }

  /**
   * Verify form is in loading state
   */
  async expectLoadingState() {
    await expect(this.submitButton).toContainText("Logowanie...");
    await expect(this.submitButton).toBeDisabled();
    await expect(this.emailInput).toBeDisabled();
    await expect(this.passwordInput).toBeDisabled();
  }

  /**
   * Verify redirect to decks page after successful login
   */
  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL("/decks");
  }

  /**
   * Navigate to registration page
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Navigate to password reset page
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Verify ARIA attributes for accessibility
   */
  async expectAccessibleForm() {
    await expect(this.emailInput).toHaveAttribute("aria-required", "true");
    await expect(this.passwordInput).toHaveAttribute("aria-required", "true");
    await expect(this.emailInput).toHaveAttribute("type", "email");
    await expect(this.passwordInput).toHaveAttribute("type", "password");
    await expect(this.emailInput).toHaveAttribute("autocomplete", "email");
    await expect(this.passwordInput).toHaveAttribute("autocomplete", "current-password");
  }
}
