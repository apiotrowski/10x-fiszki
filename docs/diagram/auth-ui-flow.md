# Diagram przepływu użytkownika - Interfejs autoryzacji

## Przepływ nawigacji między stronami

```mermaid
graph TD
    A[Strona główna /] --> B[/auth/login]
    A --> C[/auth/register]
    
    B --> D{Logowanie}
    D -->|Sukces| E[Przekierowanie do /decks]
    D -->|Błąd| B
    D -->|Zapomniałem hasła| F[/auth/reset-password]
    D -->|Nie mam konta| C
    
    C --> G{Rejestracja}
    G -->|Sukces| H[Komunikat: Sprawdź email]
    G -->|Błąd| C
    G -->|Mam już konto| B
    
    F --> I{Reset hasła}
    I -->|Sukces| J[Komunikat: Link wysłany]
    I -->|Błąd| F
    I -->|Pamiętam hasło| B
    I -->|Nie mam konta| C
    
    style E fill:#90EE90
    style H fill:#90EE90
    style J fill:#90EE90
```

## Struktura strony logowania (/auth/login)

```
┌─────────────────────────────────────┐
│ Header: 10x Flashcards              │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │  Zaloguj się              │    │
│   │  Wprowadź swoje dane...   │    │
│   ├───────────────────────────┤    │
│   │  Email *                  │    │
│   │  [twoj@email.com        ] │    │
│   │                           │    │
│   │  Hasło *                  │    │
│   │  [••••••••              ] │    │
│   │                           │    │
│   │      Nie pamiętasz hasła? │    │
│   │                           │    │
│   │  [   Zaloguj się       ]  │    │
│   │                           │    │
│   │  Nie masz konta?          │    │
│   │  Zarejestruj się          │    │
│   └───────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ Footer: © 2025 10x Flashcards       │
└─────────────────────────────────────┘
```

## Struktura strony rejestracji (/auth/register)

```
┌─────────────────────────────────────┐
│ Header: 10x Flashcards              │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │  Utwórz konto             │    │
│   │  Wypełnij formularz...    │    │
│   ├───────────────────────────┤    │
│   │  Email *                  │    │
│   │  [twoj@email.com        ] │    │
│   │                           │    │
│   │  Hasło *                  │    │
│   │  [••••••••              ] │    │
│   │  Hasło musi mieć co       │    │
│   │  najmniej 8 znaków        │    │
│   │                           │    │
│   │  Potwierdź hasło *        │    │
│   │  [••••••••              ] │    │
│   │                           │    │
│   │  [   Zarejestruj się   ]  │    │
│   │                           │    │
│   │  Masz już konto?          │    │
│   │  Zaloguj się              │    │
│   └───────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ Footer: © 2025 10x Flashcards       │
└─────────────────────────────────────┘
```

## Struktura strony resetowania hasła (/auth/reset-password)

```
┌─────────────────────────────────────┐
│ Header: 10x Flashcards              │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │  Resetuj hasło            │    │
│   │  Wprowadź swój adres...   │    │
│   ├───────────────────────────┤    │
│   │  Email *                  │    │
│   │  [twoj@email.com        ] │    │
│   │                           │    │
│   │  [Wyślij link resetujący] │    │
│   │                           │    │
│   │  Pamiętasz hasło?         │    │
│   │  Zaloguj się              │    │
│   │                           │    │
│   │  Nie masz konta?          │    │
│   │  Zarejestruj się          │    │
│   └───────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ Footer: © 2025 10x Flashcards       │
└─────────────────────────────────────┘
```

## Stany formularza

### Stan domyślny
- Wszystkie pola puste
- Przyciski aktywne
- Brak komunikatów

### Stan walidacji (błąd)
```
┌───────────────────────────┐
│ Email *                   │
│ [niepoprawny-email      ] │ ← czerwona ramka
│ ⚠ Wprowadź poprawny       │
│   adres email             │
└───────────────────────────┘
```

### Stan ładowania
```
┌───────────────────────────┐
│ [   Logowanie...       ]  │ ← przycisk nieaktywny
└───────────────────────────┘
```

### Stan sukcesu (rejestracja/reset)
```
┌─────────────────────────────────┐
│ ✓ Rejestracja zakończona        │
│   pomyślnie! Sprawdź swoją      │
│   skrzynkę email i potwierdź... │ ← zielone tło
└─────────────────────────────────┘
```

### Stan błędu globalnego
```
┌─────────────────────────────────┐
│ ⚠ Wystąpił błąd podczas         │
│   logowania. Spróbuj ponownie.  │ ← czerwone tło
└─────────────────────────────────┘
```

## Responsywność

### Desktop (> 768px)
- Formularz wycentrowany
- Maksymalna szerokość: 28rem (448px)
- Pełne marginesy

### Mobile (< 768px)
- Formularz dopasowany do szerokości ekranu
- Zachowane paddingi 1rem
- Wszystkie elementy stackowane pionowo

## Dostępność (A11y)

### Nawigacja klawiaturą
1. Tab - przejście do następnego pola
2. Shift+Tab - przejście do poprzedniego pola
3. Enter - wysłanie formularza
4. Escape - (przyszła funkcja: zamknięcie modalu)

### Screen readers
- Wszystkie pola mają etykiety (Label)
- Błędy walidacji są oznaczone aria-invalid
- Komunikaty błędów połączone z polami przez aria-describedby
- Role dla alertów (alert, status)

### Fokus
- Widoczne obramowanie fokusa (focus-visible:ring)
- Logiczna kolejność tabulacji
- Fokus na pierwszym błędzie po walidacji

