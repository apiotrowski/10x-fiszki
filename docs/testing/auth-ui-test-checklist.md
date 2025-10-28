# Lista kontrolna testowania UI modułu autoryzacji

## Przegląd
Ten dokument zawiera listę kontrolną do manualnego testowania interfejsu użytkownika modułu autoryzacji.

## Przygotowanie do testów

### Uruchomienie aplikacji
```bash
npm run dev
```

### Dostępne strony
- http://localhost:4321/auth/login
- http://localhost:4321/auth/register
- http://localhost:4321/auth/reset-password

## 1. Testy strony logowania (/auth/login)

### 1.1 Renderowanie i układ
- [ ] Strona ładuje się bez błędów
- [ ] Header z logo/nazwą aplikacji jest widoczny
- [ ] Formularz jest wycentrowany
- [ ] Footer jest widoczny na dole strony
- [ ] Wszystkie elementy są czytelne w dark mode

### 1.2 Pola formularza
- [ ] Pole email jest widoczne z etykietą "Email *"
- [ ] Pole hasło jest widoczne z etykietą "Hasło *"
- [ ] Placeholder w polu email: "twoj@email.com"
- [ ] Placeholder w polu hasło: "••••••••"
- [ ] Hasło jest maskowane (type="password")

### 1.3 Walidacja po stronie klienta
- [ ] Pusty email - komunikat: "Adres email jest wymagany"
- [ ] Niepoprawny format email - komunikat: "Wprowadź poprawny adres email"
- [ ] Puste hasło - komunikat: "Hasło jest wymagane"
- [ ] Błędy wyświetlają się pod odpowiednimi polami
- [ ] Błędy znikają po rozpoczęciu edycji pola

### 1.4 Linki nawigacyjne
- [ ] Link "Nie pamiętasz hasła?" prowadzi do /auth/reset-password
- [ ] Link "Zarejestruj się" prowadzi do /auth/register
- [ ] Linki są widoczne i klikalne
- [ ] Hover efekt na linkach działa

### 1.5 Przycisk wysyłania
- [ ] Przycisk "Zaloguj się" jest widoczny
- [ ] Przycisk staje się nieaktywny podczas ładowania
- [ ] Tekst zmienia się na "Logowanie..." podczas ładowania
- [ ] Przycisk ma hover efekt

### 1.6 Responsywność
- [ ] Formularz dobrze wygląda na mobile (< 768px)
- [ ] Formularz dobrze wygląda na tablet (768px - 1024px)
- [ ] Formularz dobrze wygląda na desktop (> 1024px)

### 1.7 Dostępność
- [ ] Nawigacja klawiszem Tab działa poprawnie
- [ ] Focus jest widoczny na elementach
- [ ] Enter w formularzu wywołuje submit
- [ ] Etykiety są powiązane z polami (kliknięcie etykiety fokusuje pole)

## 2. Testy strony rejestracji (/auth/register)

### 2.1 Renderowanie i układ
- [ ] Strona ładuje się bez błędów
- [ ] Header z logo/nazwą aplikacji jest widoczny
- [ ] Formularz jest wycentrowany
- [ ] Footer jest widoczny na dole strony
- [ ] Wszystkie elementy są czytelne w dark mode

### 2.2 Pola formularza
- [ ] Pole email jest widoczne z etykietą "Email *"
- [ ] Pole hasło jest widoczne z etykietą "Hasło *"
- [ ] Pole potwierdzenia hasła jest widoczne z etykietą "Potwierdź hasło *"
- [ ] Podpowiedź "Hasło musi mieć co najmniej 8 znaków" jest widoczna
- [ ] Wszystkie hasła są maskowane

### 2.3 Walidacja po stronie klienta
- [ ] Pusty email - komunikat: "Adres email jest wymagany"
- [ ] Niepoprawny format email - komunikat: "Wprowadź poprawny adres email"
- [ ] Puste hasło - komunikat: "Hasło jest wymagane"
- [ ] Hasło < 8 znaków - komunikat: "Hasło musi mieć co najmniej 8 znaków"
- [ ] Hasło > 72 znaki - komunikat: "Hasło nie może przekraczać 72 znaków"
- [ ] Puste potwierdzenie - komunikat: "Potwierdzenie hasła jest wymagane"
- [ ] Niezgodne hasła - komunikat: "Hasła nie są identyczne"
- [ ] Błędy wyświetlają się pod odpowiednimi polami
- [ ] Błędy znikają po rozpoczęciu edycji pola

### 2.4 Komunikat sukcesu
- [ ] Po "udanej" rejestracji (mock) wyświetla się zielony komunikat
- [ ] Komunikat zawiera informację o potwierdzeniu email
- [ ] Pola formularza są czyszczone po sukcesie

### 2.5 Linki nawigacyjne
- [ ] Link "Zaloguj się" prowadzi do /auth/login
- [ ] Linki są widoczne i klikalne
- [ ] Hover efekt na linkach działa

### 2.6 Przycisk wysyłania
- [ ] Przycisk "Zarejestruj się" jest widoczny
- [ ] Przycisk staje się nieaktywny podczas ładowania
- [ ] Tekst zmienia się na "Rejestracja..." podczas ładowania
- [ ] Przycisk ma hover efekt

### 2.7 Responsywność
- [ ] Formularz dobrze wygląda na mobile (< 768px)
- [ ] Formularz dobrze wygląda na tablet (768px - 1024px)
- [ ] Formularz dobrze wygląda na desktop (> 1024px)

### 2.8 Dostępność
- [ ] Nawigacja klawiszem Tab działa poprawnie
- [ ] Focus jest widoczny na elementach
- [ ] Enter w formularzu wywołuje submit
- [ ] Etykiety są powiązane z polami

## 3. Testy strony resetowania hasła (/auth/reset-password)

### 3.1 Renderowanie i układ
- [ ] Strona ładuje się bez błędów
- [ ] Header z logo/nazwą aplikacji jest widoczny
- [ ] Formularz jest wycentrowany
- [ ] Footer jest widoczny na dole strony
- [ ] Wszystkie elementy są czytelne w dark mode

### 3.2 Pola formularza
- [ ] Pole email jest widoczne z etykietą "Email *"
- [ ] Placeholder w polu email: "twoj@email.com"
- [ ] Opis "Wprowadź swój adres email..." jest widoczny

### 3.3 Walidacja po stronie klienta
- [ ] Pusty email - komunikat: "Adres email jest wymagany"
- [ ] Niepoprawny format email - komunikat: "Wprowadź poprawny adres email"
- [ ] Błędy wyświetlają się pod polem
- [ ] Błąd znika po rozpoczęciu edycji pola

### 3.4 Komunikat sukcesu
- [ ] Po "udanym" wysłaniu (mock) wyświetla się zielony komunikat
- [ ] Komunikat zawiera informację o sprawdzeniu skrzynki email
- [ ] Pole email jest czyszczone po sukcesie

### 3.5 Linki nawigacyjne
- [ ] Link "Zaloguj się" prowadzi do /auth/login
- [ ] Link "Zarejestruj się" prowadzi do /auth/register
- [ ] Linki są widoczne i klikalne
- [ ] Hover efekt na linkach działa

### 3.6 Przycisk wysyłania
- [ ] Przycisk "Wyślij link resetujący" jest widoczny
- [ ] Przycisk staje się nieaktywny podczas ładowania
- [ ] Tekst zmienia się na "Wysyłanie..." podczas ładowania
- [ ] Przycisk ma hover efekt

### 3.7 Responsywność
- [ ] Formularz dobrze wygląda na mobile (< 768px)
- [ ] Formularz dobrze wygląda na tablet (768px - 1024px)
- [ ] Formularz dobrze wygląda na desktop (> 1024px)

### 3.8 Dostępność
- [ ] Nawigacja klawiszem Tab działa poprawnie
- [ ] Focus jest widoczny na elementach
- [ ] Enter w formularzu wywołuje submit
- [ ] Etykieta jest powiązana z polem

## 4. Testy cross-browser

### 4.1 Chrome/Chromium
- [ ] Wszystkie strony renderują się poprawnie
- [ ] Walidacja działa
- [ ] Stylowanie jest zgodne z projektem

### 4.2 Firefox
- [ ] Wszystkie strony renderują się poprawnie
- [ ] Walidacja działa
- [ ] Stylowanie jest zgodne z projektem

### 4.3 Safari (jeśli dostępny)
- [ ] Wszystkie strony renderują się poprawnie
- [ ] Walidacja działa
- [ ] Stylowanie jest zgodne z projektem

## 5. Testy wydajności

### 5.1 Czas ładowania
- [ ] Strony ładują się < 2 sekundy
- [ ] Brak widocznego CLS (Content Layout Shift)
- [ ] Formularze są interaktywne natychmiast

### 5.2 Bundle size
- [ ] LoginForm.js: ~3 kB (✓ 3.13 kB)
- [ ] RegisterForm.js: ~4 kB (✓ 4.39 kB)
- [ ] ResetPasswordForm.js: ~3 kB (✓ 2.93 kB)

## 6. Testy accessibility (a11y)

### 6.1 Screen reader
- [ ] Etykiety pól są czytane poprawnie
- [ ] Błędy walidacji są ogłaszane
- [ ] Komunikaty sukcesu/błędu są ogłaszane
- [ ] Role są poprawnie przypisane

### 6.2 Kontrast kolorów
- [ ] Tekst ma wystarczający kontrast względem tła
- [ ] Błędy są widoczne (nie tylko kolor)
- [ ] Fokus jest wyraźnie widoczny

### 6.3 Nawigacja klawiaturą
- [ ] Można wypełnić cały formularz bez myszy
- [ ] Skip links działają (jeśli zaimplementowane)
- [ ] Focus trap w formularzach (jeśli zaimplementowany)

## Uwagi dotyczące testowania

### Backend nie jest jeszcze zaimplementowany
Ponieważ backend nie został jeszcze zaimplementowany, formularze:
- Nie wysyłają prawdziwych requestów do API
- Nie wykonują rzeczywistej rejestracji/logowania
- Nie przekierowują po sukcesie

### Co można przetestować obecnie
- ✅ Renderowanie i layout
- ✅ Walidację po stronie klienta
- ✅ Interakcje użytkownika (wpisywanie, klikanie)
- ✅ Responsywność
- ✅ Dostępność
- ✅ Nawigację między stronami
- ✅ Stany UI (loading, error, success - mock)

### Co będzie możliwe do przetestowania po implementacji backend
- ❌ Rzeczywiste logowanie
- ❌ Rzeczywista rejestracja
- ❌ Wysyłanie emaili
- ❌ Przekierowania po autoryzacji
- ❌ Integracja z Supabase
- ❌ Zarządzanie sesją

## Zgłaszanie błędów

Jeśli znajdziesz błędy podczas testowania, zapisz:
1. Krok po kroku jak odtworzyć błąd
2. Oczekiwane zachowanie
3. Rzeczywiste zachowanie
4. Przeglądarka i system operacyjny
5. Screenshot (jeśli możliwe)

