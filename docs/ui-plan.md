# UI Architecture for AI-Powered Flashcard Generation Platform

## 1. UI Structure Overview

The UI is structured to provide a seamless and secure user experience with clear separation of functionality into dedicated views. The design focuses on accessibility, responsiveness, and a logical flow of interactions. The architecture leverages the modular components from the underlying React and Astro frameworks, ensuring tight integration with backend API endpoints while addressing user pain points and edge cases.

## 2. View List

### 2.1. Authentication Views

- **View Name:** Login & Registration
- **View Path:** `/login` and `/register`
- **Main Purpose:** Enable users to securely register and log in using their email and password, ensuring proper JWT token management.
- **Key Information to Display:** Form fields for credentials (email, password), error messages, and confirmation notifications.
- **Key View Components:** Form inputs, validation alerts, loading indicators, and secure password handling components.
- **UX, Accessibility, and Security Considerations:** Ensure keyboard navigability, ARIA labels on form elements, secure handling of personal information, and inline error feedback.

### 2.2. Dashboard

- **View Name:** Dashboard (Deck List)
- **View Path:** `/dashboard` or `/decks`
- **Main Purpose:** Present an overview of all user decks with options to filter, search, paginate, and create new decks.
- **Key Information to Display:** List of decks (title, metadata, creation date), pagination controls, search bar, and deck creation button.
- **Key View Components:** Data tables or list views, search input, filtering dropdowns, pagination component, and action buttons.
- **UX, Accessibility, and Security Considerations:** Ensure focus management for lists, proper contrast for readability, and secure API calls to retrieve only authorized decks.

### 2.3. Deck Detail View

- **View Name:** Deck Details
- **View Path:** `/decks/{deckId}`
- **Main Purpose:** Display detailed information about a selected deck along with its associated flashcards and options for editing or deletion.
- **Key Information to Display:** Deck title, metadata, flashcard list, and controls for adding flashcards manually or through AI generation.
- **Key View Components:** Flashcard list, deck information header, action buttons (edit, delete, add flashcards), and modals for confirmation.
- **UX, Accessibility, and Security Considerations:** Provide clear alerts for destructive actions, maintain accessibility in modal dialogs, and ensure users can only see and interact with their own decks.

### 2.4. Flashcard Creation Views

- **View Name:** Manual Flashcard Creation
- **View Path:** `/decks/{deckId}/flashcards/new`
- **Main Purpose:** Enable users to add flashcards manually with validations for input lengths and content.
- **Key Information to Display:** Form for entering flashcard `front`, `back`, and selecting flashcard type.
- **Key View Components:** Input fields, validation message displays, and a save button that triggers API creation endpoint.
- **UX, Accessibility, and Security Considerations:** Inline form validations, accessible labels, and clear error feedback if input lengths or formats do not meet the requirements.

- **View Name:** AI Flashcard Generation Proposal
- **View Path:** `/decks/{deckId}/generations/new`
- **Main Purpose:** Allow users to input text to generate flashcard proposals via AI, review proposals, and optionally convert them into actual flashcards.
- **Key Information to Display:** Text input area for content, generated flashcard proposals with preview mode, daily generation limit messages, and fallback instructions.
- **Key View Components:** Textarea, loading indicator during AI call, proposal card components, and acceptance controls (buttons to approve proposals).
- **UX, Accessibility, and Security Considerations:** Address possible API failure states with informative messages, provide progress feedback, and ensure that the daily limit enforcement is clearly displayed.

### 2.5. Study Session View

- **View Name:** Study/Review Session
- **View Path:** `/study-session`
- **Main Purpose:** Guide users through a spaced repetition study session, presenting one flashcard at a time with evaluation options.
- **Key Information to Display:** The current flashcard, options for rating (Again, Hard, Good, Easy), and session progress indicators.
- **Key View Components:** Flashcard display, rating buttons, timer/score display, and progress indicators.
- **UX, Accessibility, and Security Considerations:** Provide clear focus states, use large interactive elements, and maintain high contrast for readability during study modes.

## 3. User Journey Map

1. **Registration/Login:** 
   - New users land on the registration page, enter credentials, and complete sign-up.
   - Returning users access the login page, enter credentials, and receive a secure JWT token upon successful authentication.

2. **Dashboard Overview:**
   - After authentication, users are directed to the dashboard where their decks are listed.
   - Users use the search and filter tools to locate a specific deck or create a new one.

3. **Deck Detail & Management:**
   - Upon selecting a deck, users see detailed information and a list of flashcards.
   - They can choose to edit deck details, delete the deck, or manage flashcards.

4. **Flashcard Creation:**
   - From the deck details, users may choose between manual flashcard creation or initiating an AI generation process.
   - For manual input, users fill in forms with appropriate validations. For AI, they input text and review generated proposals.

5. **Study Session:**
   - Users launch a study session from their deck, engaging with flashcards one by one and rating their recall.
   - Session progress is tracked until completion, and results may be used to adjust future study sessions.

## 4. Layout and Navigation Structure

- **Primary Navigation:** A persistent header/navigation bar accessible from all views includes links to the Dashboard, Profile, and Log Out.
- **Side Navigation (optional):** In detailed views (e.g., Deck Detail), a sidebar may be used to navigate between deck management options such as editing, flashcard management, and study sessions.
- **Breadcrumbs:** Used in deep layouts (e.g., Deck Detail and Flashcard Creation) to allow users to retrace their steps.
- **Modals and Alerts:** For confirmation of destructive actions (deleting a deck or flashcard) and to provide error messages.
- **Responsive Design:** Navigation elements are designed to collapse into a hamburger menu on mobile devices, ensuring accessibility and ease of use.

## 5. Key Components

- **Form Components:** Input fields, textareas, and buttons with validation and accessibility features.
- **Data Display Components:** Lists, tables, and cards that display decks, flashcards, and study progress.
- **Modals:** For confirmation and additional details without leaving the current page.
- **Navigation Elements:** Persistent header, sidebars, and breadcrumbs that facilitate movement between views.
- **Feedback Components:** Loading indicators, error messages, and inline validations to guide user interactions.
- **Interactive Elements:** Buttons and links with clear focus states and ARIA labels to support keyboard navigation and screen reader compatibility.


