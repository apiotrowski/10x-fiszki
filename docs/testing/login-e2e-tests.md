# Testy E2E dla Logowania

## Przegląd

Testy E2E dla scenariusza logowania użytkownika zostały zaimplementowane z użyciem Playwright. Testy weryfikują pełny przepływ logowania, walidację formularza oraz obsługę błędów.

## Struktura Plików

```
e2e/
├── fixtures/
│   └── test-users.ts          # Dane testowych użytkowników
├── page-objects/
│   └── LoginPage.ts            # Page Object Model dla strony logowania
└── auth/
    ├── login.spec.ts           # Testy bezpośrednie (bez POM)
    └── login-with-pom.spec.ts  # Testy z użyciem POM
```

## Dodane Atrybuty `data-test-id`

### LoginForm.tsx

| Element | data-test-id | Opis |
|---------|-------------|------|
| Card | `login-form-card` | Główny kontener formularza |
| Form | `login-form` | Element formularza |
| Email Input | `login-email-input` | Pole email |
| Password Input | `login-password-input` | Pole hasła |
| Submit Button | `login-submit-button` | Przycisk "Zaloguj się" |
| Email Error | `login-email-error` | Komunikat błędu walidacji email |
| Password Error | `login-password-error` | Komunikat błędu walidacji hasła |
| Submit Error | `login-submit-error` | Komunikat błędu logowania |

### login.astro

| Element | data-test-id | Opis |
|---------|-------------|------|
| Page Container | `login-page` | Kontener strony logowania |

## Fixtures Testowe

### Dostępni Użytkownicy Testowi

```typescript
// Prawidłowy użytkownik
validTestUser = {
  email: "test@example.com",
  password: "TestPassword123!",
  name: "Test User"
}

// Nieprawidłowy użytkownik (złe hasło)
invalidTestUser = {
  email: "invalid@example.com",
  password: "WrongPassword123!"
}

// Nieprawidłowy format email
invalidEmailUser = {
  email: "invalid-email",
  password: "TestPassword123!"
}

// Puste hasło
emptyPasswordUser = {
  email: "test@example.com",
  password: ""
}
```

## Scenariusze Testowe

### 1. Wyświetlanie Formularza
- ✅ Weryfikacja obecności wszystkich elementów formularza
- ✅ Sprawdzenie widoczności pól i przycisków

### 2. Pomyślne Logowanie
- ✅ Wypełnienie formularza prawidłowymi danymi
- ✅ Kliknięcie przycisku "Zaloguj się"
- ✅ Weryfikacja przekierowania do `/decks`

### 3. Nieprawidłowe Dane Logowania
- ✅ Wypełnienie formularza nieprawidłowymi danymi
- ✅ Weryfikacja wyświetlenia komunikatu błędu

### 4. Walidacja Email
- ✅ Nieprawidłowy format email
- ✅ Puste pole email
- ✅ Weryfikacja komunikatu "Wprowadź poprawny adres email"
- ✅ Weryfikacja komunikatu "Adres email jest wymagany"

### 5. Walidacja Hasła
- ✅ Puste pole hasła
- ✅ Weryfikacja komunikatu "Hasło jest wymagane"

### 6. Czyszczenie Błędów Walidacji
- ✅ Wyświetlenie błędów walidacji
- ✅ Wpisanie tekstu w pole email - błąd znika
- ✅ Wpisanie tekstu w pole hasła - błąd znika

### 7. Stan Ładowania
- ✅ Dezaktywacja pól podczas wysyłania
- ✅ Zmiana tekstu przycisku na "Logowanie..."
- ✅ Dezaktywacja przycisku submit

### 8. Dostępność (Accessibility)
- ✅ Weryfikacja atrybutów ARIA
- ✅ Sprawdzenie `aria-required="true"`
- ✅ Sprawdzenie odpowiednich typów pól
- ✅ Weryfikacja atrybutów `autocomplete`

### 9. Nawigacja
- ✅ Link do rejestracji → `/auth/register`
- ✅ Link "Nie pamiętasz hasła?" → `/auth/reset-password`

## Page Object Model

### LoginPage

Klasa `LoginPage` enkapsuluje wszystkie interakcje ze stroną logowania:

#### Właściwości (Locators)
- `pageContainer` - kontener strony
- `formCard` - karta formularza
- `emailInput` - pole email
- `passwordInput` - pole hasła
- `submitButton` - przycisk submit
- `emailError` - błąd email
- `passwordError` - błąd hasła
- `submitError` - błąd logowania

#### Metody Akcji
- `goto()` - nawigacja do strony logowania
- `fillCredentials(email, password)` - wypełnienie formularza
- `fillCredentialsFromUser(user)` - wypełnienie z obiektu TestUser
- `submit()` - wysłanie formularza
- `login(email, password)` - pełny przepływ logowania
- `loginWithUser(user)` - pełny przepływ z obiektem TestUser
- `goToRegister()` - nawigacja do rejestracji
- `goToForgotPassword()` - nawigacja do reset hasła

#### Metody Asercji
- `expectFormToBeVisible()` - weryfikacja widoczności formularza
- `expectEmailError(message?)` - weryfikacja błędu email
- `expectPasswordError(message?)` - weryfikacja błędu hasła
- `expectSubmitError()` - weryfikacja błędu logowania
- `expectNoEmailError()` - weryfikacja braku błędu email
- `expectNoPasswordError()` - weryfikacja braku błędu hasła
- `expectLoadingState()` - weryfikacja stanu ładowania
- `expectSuccessfulLogin()` - weryfikacja pomyślnego logowania
- `expectAccessibleForm()` - weryfikacja dostępności

## Uruchamianie Testów

### Wszystkie testy logowania
```bash
npx playwright test e2e/auth/login
```

### Tylko testy z POM
```bash
npx playwright test e2e/auth/login-with-pom
```

### Tryb UI (interaktywny)
```bash
npx playwright test --ui
```

### Z raportem
```bash
npx playwright test e2e/auth/login --reporter=html
npx playwright show-report
```

### Debugowanie
```bash
npx playwright test e2e/auth/login --debug
```

## Wymagania

### Środowisko Testowe
- Testowy użytkownik musi istnieć w bazie danych
- Email: `test@example.com`
- Hasło: `TestPassword123!`

### Konfiguracja
Testy używają konfiguracji z `playwright.config.ts`:
- Browser: Chromium (Desktop Chrome)
- Base URL: zgodnie z konfiguracją projektu
- Timeout: domyślny timeout Playwright

## Best Practices

1. **Arrange-Act-Assert** - każdy test jest podzielony na 3 sekcje
2. **Page Object Model** - enkapsulacja logiki strony
3. **Data-testid** - stabilne selektory odporne na zmiany CSS
4. **Fixtures** - reużywalne dane testowe
5. **Accessibility** - weryfikacja atrybutów ARIA
6. **Loading States** - testowanie stanów przejściowych

## Przyszłe Rozszerzenia

- [ ] Testy wizualne (screenshot comparison)
- [ ] Testy API dla endpointu `/api/auth/login`
- [ ] Testy wydajnościowe (performance)
- [ ] Testy na różnych rozdzielczościach
- [ ] Testy na różnych przeglądarkach (Firefox, Safari)
- [ ] Integracja z CI/CD

