import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Study Session Page
 * Encapsulates all interactions with the study session page
 */
export class StudySessionPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly pageTitle: Locator;
  readonly progressIndicator: Locator;
  readonly flashcardCard: Locator;
  readonly flashcardFront: Locator;
  readonly flipButton: Locator;
  readonly againButton: Locator;
  readonly hardButton: Locator;
  readonly goodButton: Locator;
  readonly easyButton: Locator;
  readonly endSessionButton: Locator;
  readonly keyboardHint: Locator;
  readonly completionCard: Locator;
  readonly statisticsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContainer = page.locator(".container");
    this.pageTitle = page.getByRole("heading", { name: "Sesja Nauki" });
    this.progressIndicator = page
      .locator("div")
      .filter({ hasText: /Przeglądnięto:/ })
      .first();
    this.flashcardCard = page.locator('[class*="card"]').first();
    this.flashcardFront = page.locator("p").filter({ hasText: /\w+/ }).first();
    this.flipButton = page.getByRole("button", { name: /Pokaż/ });
    this.againButton = page.getByRole("button", { name: "Jeszcze raz" });
    this.hardButton = page.getByRole("button", { name: "Trudne" });
    this.goodButton = page.getByRole("button", { name: "Dobre" });
    this.easyButton = page.getByRole("button", { name: "Łatwe" });
    this.endSessionButton = page.getByRole("button", { name: "Zakończ sesję" });
    this.keyboardHint = page.locator("text=Możesz użyć skrótów klawiszowych");
    this.completionCard = page.locator("text=Sesja zakończona!");
    this.statisticsSection = page.locator("text=Statystyki sesji:");
  }

  /**
   * Navigate to study session page for a specific deck
   */
  async goto(deckId: string) {
    await this.page.goto(`/study-session?deck_id=${deckId}`);
  }

  /**
   * Wait for the page to load
   */
  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Flip the current flashcard
   */
  async flipFlashcard() {
    await this.flipButton.click();
  }

  /**
   * Rate the current flashcard
   */
  async rateFlashcard(rating: "again" | "hard" | "good" | "easy") {
    const buttons = {
      again: this.againButton,
      hard: this.hardButton,
      good: this.goodButton,
      easy: this.easyButton,
    };
    await buttons[rating].click();
  }

  /**
   * Rate using keyboard shortcut
   */
  async rateWithKeyboard(key: "1" | "2" | "3" | "4") {
    await this.page.keyboard.press(key);
  }

  /**
   * End the study session
   */
  async endSession() {
    await this.endSessionButton.click();
  }

  /**
   * Verify the page has loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.progressIndicator).toBeVisible();
    await expect(this.flashcardCard).toBeVisible();
  }

  /**
   * Verify flashcard is displayed
   */
  async expectFlashcardVisible() {
    await expect(this.flashcardCard).toBeVisible();
    await expect(this.flipButton).toBeVisible();
  }

  /**
   * Verify rating buttons are visible
   */
  async expectRatingButtonsVisible() {
    await expect(this.againButton).toBeVisible();
    await expect(this.hardButton).toBeVisible();
    await expect(this.goodButton).toBeVisible();
    await expect(this.easyButton).toBeVisible();
  }

  /**
   * Verify keyboard hints are shown
   */
  async expectKeyboardHintsVisible() {
    await expect(this.keyboardHint).toBeVisible();
  }

  /**
   * Verify session completion screen
   */
  async expectSessionComplete() {
    await expect(this.completionCard).toBeVisible();
  }

  /**
   * Verify statistics are displayed
   */
  async expectStatisticsVisible() {
    await expect(this.statisticsSection).toBeVisible();
  }

  /**
   * Get progress text
   */
  async getProgress(): Promise<string> {
    return (await this.progressIndicator.textContent()) || "";
  }

  /**
   * Wait for next flashcard to load
   */
  async waitForNextFlashcard() {
    await this.page.waitForTimeout(1000); // Wait for API call
    await this.expectFlashcardVisible();
  }
}
