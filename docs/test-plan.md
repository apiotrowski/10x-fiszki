# Kompleksowy Plan Testów

## 1. Wprowadzenie i cel
- Projekt to system oparty o technologie Astro, React, TypeScript, Tailwind CSS oraz komponenty Shadcn/ui, wspierający dynamiczny interfejs użytkownika oraz zintegrowany backend oparty o Supabase.
- Celem testowania jest zapewnienie wysokiej jakości oprogramowania poprzez identyfikację błędów, potwierdzenie zgodności funkcjonalnej i wizualnej oraz zapewnienie stabilności podczas skalowania projektu.

## 2. Zakres testów
- Testowane będą następujące obszary:
  - Komponenty frontendowe (Astro + React)
  - Endpointy API oraz middleware
  - Integracja z bazą danych Supabase
  - Procesy autoryzacji i rejestracji użytkowników
  - Interfejs użytkownika i komponenty UI (Shadcn/ui, Tailwind CSS)
  - Komunikacja pomiędzy warstwami aplikacji (frontend-backend)
- Testowanie nie obejmuje:
  - Testów prostych operacji walidacyjnych, które nie wpływają na logikę biznesową
  - Testów środowisk developerskich nieodzwierciedlających produkcyjnego workflow

## 3. Strategia testowa
- **Typy testów:**
  - Testy jednostkowe: Funkcje pomocnicze, komponenty React, moduły API (Vitest + React Testing Library)
  - Testy integracyjne: Sprawdzanie przepływu danych między komponentami oraz komunikacji frontend-backend (Vitest + MSW)
  - Testy end-to-end: Symulacja pełnych scenariuszy użytkownika (np. rejestracja, logowanie, CRUD) z wykorzystaniem Playwright
  - Testy wizualne: Regresja wizualna kluczowych komponentów UI przy użyciu Playwright Visual Comparisons
  - Testy dostępności: Automatyczne wykrywanie problemów WCAG z @axe-core/playwright
  - Testy typów: Weryfikacja poprawności typów TypeScript z expect-type
  - Testy wydajnościowe: Analiza czasów odpowiedzi i renderowania (Playwright Performance API)
- **Poziomy testowania:**
  - Jednostkowe (Vitest)
  - Integracyjne (Vitest + MSW)
  - Systemowe (Playwright E2E)
  - Akceptacyjne (manualne/automatyczne z Playwright)

## 4. Środowiska testowe
- **Wymagania:**
  - Środowisko developerskie z pełnym dostępem do bazy danych Supabase (lub jej symulacja lokalna)
  - Środowisko staging odzwierciedlające konfigurację produkcyjną do testów end-to-end
  - Automatyzacja testów zintegrowana z CI/CD (np. GitHub Actions)
- **Konfiguracje:**
  - Baza danych testowa z przykładowymi danymi
  - Odpowiednie zmienne środowiskowe (env variables) zgodne z produkcją

## 5. Narzędzia i technologie testowe

### Backend / API
- **Vitest** - framework testowy zintegrowany z Vite/Astro
  - Szybki, nowoczesny, kompatybilny z TypeScript out-of-the-box
  - Natywne wsparcie dla ESM
  - @vitest/ui dla wizualizacji wyników testów
- **Natywny fetch API** - do testowania endpointów Astro (zgodny z Web Standards)
- **MSW (Mock Service Worker)** - mockowanie API Supabase w testach
  - Działa zarówno w testach jak i w trybie deweloperskim
  - Realistyczne mockowanie HTTP requests

### Frontend / React
- **React Testing Library** - testowanie komponentów React 19
  - Promuje testowanie zachowań użytkownika zamiast implementacji
  - @testing-library/user-event dla symulacji interakcji
- **Vitest** - jako test runner
- **happy-dom** - szybkie środowisko DOM (alternatywa dla jsdom)
  - 2-3x szybszy niż jsdom
  - Lepsze wsparcie dla nowoczesnych Web APIs

### Astro
- **Vitest** z integracją Astro dla testów jednostkowych
- **Playwright** dla testów E2E stron Astro (SSR/SSG)
  - Natywne wsparcie dla testowania renderowania po stronie serwera

### TypeScript
- **tsc --noEmit** - kompilacja i weryfikacja typów
- **ESLint** - analiza statyczna kodu (już skonfigurowane w projekcie)
- **expect-type** (Vitest) - testowanie typów TypeScript

### Testy E2E
- **Playwright** - nowoczesne narzędzie do testów end-to-end
  - Multi-browser testing (Chrome, Firefox, Safari, Edge)
  - Wbudowane auto-waiting i retry logic
  - Test generator (codegen) dla szybkiego tworzenia testów
  - Trace viewer dla debugowania
  - Screenshots i video recording out-of-the-box

### Testy wizualne
- **Playwright Visual Comparisons** - wbudowane porównania wizualne
  - Darmowe, zintegrowane z Playwright
  - Wystarczające dla większości przypadków użycia
- **Alternatywy** (opcjonalnie):
  - Argos - open source platforma do visual testing
  - Percy - zaawansowane funkcje (płatne po limicie)

### Testy dostępności
- **@axe-core/playwright** - automatyczne testy zgodności WCAG
  - Integracja z testami E2E
  - Wykrywanie problemów z dostępnością

### Coverage
- **@vitest/coverage-v8** - analiza pokrycia kodu testami
  - Szybszy niż istanbul
  - Natywna integracja z Vitest

### CI/CD
- **GitHub Actions** - automatyzacja testów
  - Cache dla node_modules i Playwright browsers
  - Równoległe uruchamianie testów
  - Integracja z pull requests

## 6. Plan wykonania testów
- **Priorytetyzacja:** (wg macierzy priorytetów)
  - Najwyższy priorytet: Rejestracja, uwierzytelnianie, kluczowe endpointy API, integracja z bazą danych
  - Średni priorytet: Komponenty UI, middleware, testy dostępności
  - Niski priorytet: Elementy pomocnicze, testy wizualne, konfiguracja projektu
- **Harmonogram:**
  - Faza 1: Konfiguracja środowiska testowego (Vitest, Playwright, MSW)
  - Faza 2: Opracowanie i uruchomienie testów jednostkowych (Vitest + React Testing Library)
  - Faza 3: Rozbudowa testów integracyjnych łączących różne warstwy aplikacji (Vitest + MSW)
  - Faza 4: Implementacja testów end-to-end symulujących pełne scenariusze użytkownika (Playwright)
  - Faza 5: Testy dostępności na kluczowych przepływach (@axe-core/playwright)
  - Faza 6: Testy wizualne na krytycznych komponentach UI (Playwright Visual Comparisons)
  - Faza 7: Integracja testów z procesem CI/CD (GitHub Actions)

## 7. Kryteria akceptacji
- Wszystkie testy jednostkowe oraz integracyjne muszą przejść pomyślnie (Vitest)
- Testy end-to-end muszą wykazywać pełną zgodność krytycznych scenariuszy użytkownika (Playwright)
- Brak krytycznych błędów wykrytych podczas testów manualnych
- Pokrycie kodu testami powinno osiągnąć ustalony poziom (minimum 80% dla krytycznych ścieżek)
- Testy wizualne nie mogą wykazywać regresji w kluczowych komponentach UI (Playwright Visual Comparisons)
- Wszystkie kluczowe przepływy muszą przejść testy dostępności bez błędów krytycznych (@axe-core/playwright)
- Brak błędów kompilacji TypeScript (tsc --noEmit)
- Brak błędów ESLint w kodzie produkcyjnym

## 8. Zarządzanie ryzykiem
- **Identyfikacja zagrożeń:**
  - Błędy w procesach autoryzacji (krytyczne dla bezpieczeństwa)
  - Problemy integracyjne między komponentami Astro a React
  - Regresje wizualne spowodowane aktualizacjami Shadcn/ui lub Tailwind CSS
  - Problemy z konfiguracją Supabase i migracjami bazy danych
  - Problemy z dostępnością (WCAG) w kluczowych przepływach
  - Flaky tests w testach E2E
- **Plany mitygacji:**
  - Regularne uruchamianie pełnego zestawu testów przy każdej zmianie w aplikacji (GitHub Actions)
  - Wprowadzenie automatycznych testów regresji wizualnej (Playwright Visual Comparisons)
  - Automatyczne testy dostępności w CI/CD (@axe-core/playwright)
  - Mockowanie zewnętrznych zależności (MSW) dla stabilnych testów
  - Wykorzystanie Playwright retry logic i auto-waiting dla stabilności testów E2E
  - Monitorowanie logów aplikacji oraz wyników testów w środowisku staging
  - Zapewnienie możliwości szybkiego przywrócenia poprzedniej stabilnej wersji w razie awarii
  - Cache dla Playwright browsers w CI/CD dla szybszego wykonywania testów

## 9. Instalacja i konfiguracja

### Wymagane zależności

```json
{
  "devDependencies": {
    // Framework testowy
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    
    // Testy komponentów React
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "happy-dom": "^15.0.0",
    
    // Testy E2E i wizualne
    "@playwright/test": "^1.48.0",
    
    // Testy dostępności
    "@axe-core/playwright": "^4.10.0",
    
    // Mockowanie API
    "msw": "^2.4.0"
  }
}
```

### Konfiguracja Vitest

Utworzyć plik `vitest.config.ts` w katalogu głównym projektu:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
});
```

### Konfiguracja Playwright

Utworzyć plik `playwright.config.ts` w katalogu głównym projektu:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Skrypty package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

