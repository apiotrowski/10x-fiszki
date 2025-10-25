# Test Cases: Manual Flashcard Creation View

## Test Environment
- Route: `/decks/{deckId}/flashcards/new`
- Component: `ManualFlashcardView`
- API Endpoint: `POST /api/decks/{deckId}/flashcards`

## Test Cases

### 1. Positive Test Cases

#### TC-1.1: Successfully create a flashcard with valid data (Question-Answer type)
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Select "Pytanie-Odpowiedź" type (default)
3. Enter valid front text (e.g., "Co to jest React?")
4. Enter valid back text (e.g., "React to biblioteka JavaScript do budowania interfejsów użytkownika")
5. Click "Utwórz fiszkę"

**Expected Result:**
- Success message appears: "Fiszka utworzona pomyślnie! Przekierowywanie do talii..."
- User is redirected to `/decks/{deckId}` after 1.5 seconds
- New flashcard appears in the deck's flashcard list

#### TC-1.2: Successfully create a flashcard with Gaps type
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Select "Luki" type
3. Enter valid front text with gaps
4. Enter valid back text
5. Click "Utwórz fiszkę"

**Expected Result:**
- Flashcard is created with type "gaps"
- Success message and redirect occur

#### TC-1.3: Reset form functionality
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter some text in front and back fields
3. Click "Resetuj"

**Expected Result:**
- All fields are cleared
- Form returns to initial state
- No errors are displayed

#### TC-1.4: Navigate back to deck
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Click "Powrót do talii" button

**Expected Result:**
- User is redirected to `/decks/{deckId}`

### 2. Validation Test Cases

#### TC-2.1: Empty front field validation
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Leave front field empty
3. Enter valid back text
4. Click "Utwórz fiszkę"

**Expected Result:**
- Error message appears under front field: "Przód fiszki jest wymagany"
- Form is not submitted
- Submit button is disabled when front is empty

#### TC-2.2: Empty back field validation
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter valid front text
3. Leave back field empty
4. Click "Utwórz fiszkę"

**Expected Result:**
- Error message appears under back field: "Tył fiszki jest wymagany"
- Form is not submitted
- Submit button is disabled when back is empty

#### TC-2.3: Front field exceeds maximum length (200 characters)
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter more than 200 characters in front field

**Expected Result:**
- Character counter shows red color when approaching/exceeding limit
- Field is limited to 200 characters (maxLength attribute)
- Error message appears if validation is triggered

#### TC-2.4: Back field exceeds maximum length (500 characters)
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter more than 500 characters in back field

**Expected Result:**
- Character counter shows red color when approaching/exceeding limit
- Field is limited to 500 characters (maxLength attribute)
- Error message appears if validation is triggered

#### TC-2.5: Character counter color changes
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter text in front field approaching 90% of limit (180+ characters)

**Expected Result:**
- Character counter changes to yellow/warning color at 90% (180 chars)
- Character counter changes to red at 100% (200 chars)

### 3. API Integration Test Cases

#### TC-3.1: Invalid deck ID
**Steps:**
1. Navigate to `/decks/invalid-deck-id/flashcards/new`
2. Fill in valid flashcard data
3. Click "Utwórz fiszkę"

**Expected Result:**
- API returns 404 error
- Error message appears: "Deck not found or you do not have permission to access it."
- User remains on the form

#### TC-3.2: Network error handling
**Steps:**
1. Disconnect from network
2. Navigate to `/decks/{valid-deckId}/flashcards/new`
3. Fill in valid flashcard data
4. Click "Utwórz fiszkę"

**Expected Result:**
- Error message appears: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie."
- User can retry after reconnecting

#### TC-3.3: Server error (500)
**Steps:**
1. Simulate server error condition
2. Fill in valid flashcard data
3. Click "Utwórz fiszkę"

**Expected Result:**
- Error message appears with appropriate message
- User can retry

### 4. UI/UX Test Cases

#### TC-4.1: Loading state during submission
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Fill in valid data
3. Click "Utwórz fiszkę"
4. Observe UI during API call

**Expected Result:**
- Submit button shows "Tworzenie..." text
- Submit button is disabled
- All form fields are disabled
- Back button is disabled

#### TC-4.2: Responsive design
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Test on different screen sizes (mobile, tablet, desktop)

**Expected Result:**
- Form is properly displayed on all screen sizes
- Card has max-width of 2xl and is centered
- All elements are accessible and usable

#### TC-4.3: Accessibility - Keyboard navigation
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Use Tab key to navigate through form
3. Use Space/Enter to interact with radio buttons and buttons

**Expected Result:**
- All interactive elements are reachable via keyboard
- Focus indicators are visible
- Radio buttons can be selected with keyboard
- Form can be submitted with Enter key

#### TC-4.4: Accessibility - Screen reader
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Use screen reader to navigate form

**Expected Result:**
- All labels are properly announced
- Required fields are indicated
- Error messages are announced (role="alert")
- Character counters are announced (aria-live="polite")
- Field validation states are announced (aria-invalid, aria-describedby)

### 5. Edge Cases

#### TC-5.1: Whitespace-only input
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter only spaces in front field
3. Enter only spaces in back field
4. Click "Utwórz fiszkę"

**Expected Result:**
- Validation treats whitespace-only as empty
- Error messages appear for both fields
- Form is not submitted

#### TC-5.2: Special characters and emojis
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Enter text with special characters and emojis in both fields
3. Click "Utwórz fiszkę"

**Expected Result:**
- Special characters and emojis are accepted
- Flashcard is created successfully
- Characters are counted correctly

#### TC-5.3: Multiple rapid submissions
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Fill in valid data
3. Click "Utwórz fiszkę" multiple times rapidly

**Expected Result:**
- Only one submission is processed
- Button is disabled after first click
- No duplicate flashcards are created

#### TC-5.4: Browser back button during submission
**Steps:**
1. Navigate to `/decks/{valid-deckId}/flashcards/new`
2. Fill in valid data
3. Click "Utwórz fiszkę"
4. Immediately press browser back button

**Expected Result:**
- Navigation is handled gracefully
- No errors occur
- If flashcard was created, it appears in the deck

## Implementation Verification Checklist

- [x] All components created and properly structured
- [x] Custom hook implements all required functionality
- [x] Form validation works client-side
- [x] API integration is correct
- [x] Error handling is comprehensive
- [x] Loading states are implemented
- [x] Success feedback is provided
- [x] Navigation works correctly
- [x] Accessibility attributes are present
- [x] Character counters work correctly
- [x] Radio group for type selection works
- [x] TypeScript types are correct
- [x] No linter errors
- [x] Build completes successfully
- [x] Routing is configured correctly

## Notes

- The implementation follows the same pattern as `CreateDeckView`
- All validation limits match the API schema (front: 200, back: 500)
- Source is automatically set to "manual"
- The API expects an array of flashcards but we send only one
- Success redirect happens after 1.5 seconds to allow user to see the message
- Form uses proper ARIA attributes for accessibility
- Character counters provide visual feedback at 90% and 100% of limit

