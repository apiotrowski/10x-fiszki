import { test, expect } from "@playwright/test";
import { StudySessionPage } from "../page-objects/StudySessionPage";
import { LoginPage } from "../page-objects/LoginPage";
import { validTestUser } from "../fixtures/test-users";

test.describe("Study Session Flow", () => {
  let studySessionPage: StudySessionPage;
  let deckId: string;

  test.beforeEach(async ({ page }) => {
    // Step 1: Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithUser(validTestUser);
    await loginPage.expectSuccessfulLogin();

    // Step 2: Create a test deck with flashcards
    // This is a simplified approach - in a real scenario, you'd use API helpers
    // For now, we'll assume a deck exists and get its ID from the decks page
    await page.waitForURL("/decks");

    // Get first deck ID from the page (assuming decks exist)
    const deckLink = page.locator('[href^="/decks/"]').first();
    const href = await deckLink.getAttribute("href");

    if (href) {
      deckId = href.split("/")[2]; // Extract deck ID from /decks/{deckId}
    } else {
      // Skip test if no decks are available
      test.skip();
    }

    // Step 3: Initialize StudySessionPage
    studySessionPage = new StudySessionPage(page);
  });

  test("should display study session page with all required elements", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Assert: Verify all elements are present
    await studySessionPage.expectPageLoaded();
    await studySessionPage.expectFlashcardVisible();
    await studySessionPage.expectRatingButtonsVisible();
    await studySessionPage.expectKeyboardHintsVisible();
  });

  test("should flip flashcard when clicking flip button", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Act: Flip the flashcard
    await studySessionPage.flipFlashcard();

    // Assert: Verify button text changes
    await expect(studySessionPage.flipButton).toContainText("Pokaż przód");
  });

  test("should rate flashcard and load next card", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Get initial progress
    const initialProgress = await studySessionPage.getProgress();

    // Act: Rate the flashcard
    await studySessionPage.rateFlashcard("good");

    // Assert: Wait for next card and verify progress updated
    await studySessionPage.waitForNextFlashcard();
    const newProgress = await studySessionPage.getProgress();

    expect(newProgress).not.toBe(initialProgress);
  });

  test("should support keyboard shortcuts for rating", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Act: Use keyboard shortcut to rate
    await studySessionPage.rateWithKeyboard("3"); // Press "3" for "Good"

    // Assert: Wait for next card to load
    await studySessionPage.waitForNextFlashcard();
    await studySessionPage.expectFlashcardVisible();
  });

  test("should track different ratings during session", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Act: Rate multiple flashcards with different ratings
    await studySessionPage.rateFlashcard("easy");
    await studySessionPage.waitForNextFlashcard();

    await studySessionPage.rateFlashcard("hard");
    await studySessionPage.waitForNextFlashcard();

    await studySessionPage.rateFlashcard("good");
    await studySessionPage.waitForNextFlashcard();

    // Continue until session completes or timeout
    // Note: This test assumes the deck has at least 3 flashcards
  });

  test("should display completion screen after reviewing all cards", async () => {
    // This test requires a deck with a known small number of flashcards
    // For demonstration, we'll rate cards until completion
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Rate cards until we reach completion (max 10 to avoid infinite loop)
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        // Check if session is complete
        const isComplete = await studySessionPage.completionCard.isVisible({ timeout: 1000 });
        if (isComplete) {
          break;
        }

        // Rate the current flashcard
        await studySessionPage.rateFlashcard("good");
        await studySessionPage.page.waitForTimeout(1500);
        attempts++;
      } catch {
        // If we can't find rating buttons, session might be complete
        break;
      }
    }

    // Assert: Verify completion screen is shown
    await studySessionPage.expectSessionComplete();
  });

  test("should show statistics on completion screen", async () => {
    // Similar to previous test, complete the session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const isComplete = await studySessionPage.completionCard.isVisible({ timeout: 1000 });
        if (isComplete) {
          break;
        }

        await studySessionPage.rateFlashcard("good");
        await studySessionPage.page.waitForTimeout(1500);
        attempts++;
      } catch {
        break;
      }
    }

    // Assert: Verify statistics are displayed
    await studySessionPage.expectSessionComplete();
    await studySessionPage.expectStatisticsVisible();
  });

  test("should allow ending session early", async () => {
    // Act: Navigate to study session
    await studySessionPage.goto(deckId);
    await studySessionPage.waitForLoad();

    // Act: End session early
    await studySessionPage.endSession();

    // Assert: Verify redirect to decks page
    await expect(studySessionPage.page).toHaveURL("/decks");
  });

  test("should redirect to decks page if no deck_id provided", async ({ page }) => {
    // Act: Navigate to study session without deck_id
    await page.goto("/study-session");

    // Assert: Verify redirect to decks page
    await expect(page).toHaveURL("/decks");
  });
});
