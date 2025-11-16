# AI Flashcards Generation Platform

[![CI/CD Status](https://github.com/apiotrowski/10x-fiszki/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/apiotrowski/10x-fiszki/actions/workflows/ci-cd.yml)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
The AI Flashcards Generation Platform is a web-based solution designed to streamline the process of creating educational flashcards. Leveraging advanced AI capabilities, the platform automatically generates flashcards from user-provided text while also supporting manual creation and editing. The system is built to facilitate efficient learning through spaced repetition, deck management, and scheduled review sessions using the FSRS algorithm. Users can register, log in, and manage their flashcards and decks with ease. Additionally, the platform enforces daily limits to ensure fair use and system stability.

## Tech Stack
- **Frontend**:  
  - **Astro 5**: Modern framework for building optimized, static or dynamic websites.
  - **React 19**: Robust library for creating interactive user interfaces.
  - **TypeScript 5**: Offers type safety and enhanced developer experience.
  - **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development.
  - **Shadcn/ui**: Pre-designed UI components that integrate with Tailwind CSS and React.
- **Backend**:  
  - **Supabase**: Provides database management, authentication, and server-side functionalities.
- **AI Integration**:  
  - **Openrouter.ai**: Connects the platform with advanced AI models for generating flashcards.
- **Testing**:  
  - **Vitest**: Modern and fast testing framework for unit and integration tests.
  - **React Testing Library**: Testing library for React components focusing on user behavior.
  - **Playwright**: End-to-end testing framework for automating user scenarios across browsers.
  - **Supertest**: HTTP assertion library for testing API endpoints.
  - **MSW (Mock Service Worker)**: API mocking library for intercepting network requests in tests.
  - **Storybook + Chromatic**: Tools for isolated component development and visual regression testing.

## Getting Started Locally
To set up the project on your local machine, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/apiotrowski/10x-fiszki.git
   cd 10x-fiszki
   ```
2. **Install Node.js**:  
   Use [nvm](https://github.com/nvm-sh/nvm) to install and use the appropriate Node version:
   ```bash
   nvm install 22.14.0
   nvm use 22.14.0
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Preview the production build** (optional):
   ```bash
   npm run build
   npm run preview
   ```

## Available Scripts

### Development
- **`npm run dev`**: Start the development server.
- **`npm run build`**: Build the project for production.
- **`npm run preview`**: Preview the production build locally.

### Code Quality
- **`npm run lint`**: Run ESLint to analyze code quality.
- **`npm run lint:fix`**: Automatically fix linting issues.
- **`npm run format`**: Format the code using Prettier.

### Testing
- **`npm run test`**: Run unit tests with Vitest.
- **`npm run test:watch`**: Run unit tests in watch mode.
- **`npm run test:coverage`**: Generate test coverage report.
- **`npm run test:e2e`**: Run end-to-end tests with Playwright.
- **`npm run test:e2e:ui`**: Run E2E tests with Playwright UI.

For more details about testing and CI/CD, see [docs/ci-cd-setup.md](docs/ci-cd-setup.md).

## Project Scope
This project is currently in the MVP stage. Key features include:
- **AI-Driven Flashcard Generation**: Automatically generate flashcards based on input text, with customizable parameters (number of flashcards, difficulty level).
- **Manual Flashcard Creation and Editing**: Allows users to create, edit, and delete flashcards.
- **Deck Management**: Organize flashcards into decks with enforced daily limits (maximum 5 new decks per day).
- **Learning Sessions**: Engage in flashcard review sessions utilizing the FSRS algorithm.
- **User Authentication**: Secure registration and login system using email and password.
- **Fallback Handling**: Manual entry is available in case of AI service issues.
- **Usage Limits**: Daily activity caps ensure system stability (max. 10 AI generations per day).

## Project Status
The platform is currently under active development as an MVP. New features and improvements are continuously being integrated based on user feedback and testing.

## License
This project is licensed under the MIT License.
