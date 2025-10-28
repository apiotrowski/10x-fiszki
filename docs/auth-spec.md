# Specyfikacja modułu autoryzacji i uwierzytelniania

## Wprowadzenie
Niniejszy dokument opisuje architekturę modułu odpowiedzialnego za rejestrację, logowanie, wylogowanie oraz odzyskiwanie hasła użytkowników w naszym systemie, zgodnie z wymaganiami zdefiniowanymi w sekcji US-001 w pliku `prd.md` oraz z zachowaniem zgodności ze stosowanym stosem technologicznym (Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui, Supabase). Dokument ten zawiera opis zmian w interfejsie użytkownika, logice backendowej oraz szczegóły integracji systemu autentykacji z Supabase.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Strony i Layouty
- **Strony publiczne**: 
  - Nowe strony dedykowane autoryzacji, w tym:
    - `Rejestracja` (signup): Formularz do rejestracji użytkownika z polami: adres email, hasło, powtórzenie hasła.
    - `Logowanie` (login): Formularz logowania z polami: adres email, hasło.
    - `Odzyskiwanie hasła` (reset password): Formularz umożliwiający wysłanie linku do resetowania hasła.
- **Layouty**: 
  - Rozdzielenie widoków na tryb autoryzowany (auth) oraz tryb gościa (non-auth). Dla stron autoryzacyjnych wykorzystywany będzie uproszczony layout bez elementów widocznych tylko dla zalogowanych użytkowników (np. menu użytkownika w nagłówku).
  - W widokach zalogowanych pozostanie użycie obecnego `Layout.astro` z odpowiednimi rozszerzeniami o strefę zarządzania sesją.

### 1.2. Komponenty Frontendowe
- **Formularze React**: 
  - Implementacja komponentów formularzy przy użyciu React i Shadcn/ui, które zostaną użyte wewnątrz stron Astro.
  - Rozdzielenie logiki formularza (zarządzanie stanem, walidacja) od prezentacji graficznej.
  - Współdzielenie komponentów dla podobnych pól, np. pola input do wprowadzania adresu email, pola hasła.

- **Walidacja i Komunikaty Błędów**:
  - Walidacja danych wejściowych odbywać się będzie zarówno po stronie klienta (przy wykorzystaniu bibliotek takich jak React Hook Form lub Formik razem z schema validatorami typu Zod), jak i po stronie serwera.
  - Komunikaty błędów będą wyświetlane inline przy polach formularza oraz w postaci globalnych alertów opisujących ogólne problemy, np. błędną kombinację email/hasło.

### 1.3. Obsługa scenariuszy użytkownika
- **Rejestracja**:
  - Użytkownik wprowadza dane, które są walidowane lokalnie (sprawdzenie poprawności formatu email, identyczności hasła oraz potwierdzenia hasła, potwierdzenie zgodności haseł, ograniczenia długości).
  - Po poprawnym wprowadzeniu danych formularz wywołuje endpoint API rejestracji.
  - Użytkownik otrzymuje powiadomienie o konieczności potwierdzenia adresu email.

- **Logowanie**:
  - Po wprowadzeniu poprawnych danych, system loguje użytkownika wykorzystując sesję z Supabase.
  - W przypadku błędów (np. niepoprawne dane) użytkownik widzi odpowiedni komunikat.

- **Odzyskiwanie hasła**:
  - Użytkownik może zażądać linku do resetu hasła po podaniu zarejestrowanego adresu email.
  - System wywołuje dedykowany endpoint API, który inicjuje proces resetowania hasła przez Supabase.
  - Powiadomienia o sukcesie lub błędzie są komunikowane użytkownikowi.

---

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API
- Endpointy zostaną umieszczone w katalogu `src/pages/api/auth/`:
  - `register.ts` - obsługa rejestracji:
    - Odbiera dane: email, hasło, potwierdzenie hasła.
    - Upewnia się, że hasło i potwierdzenie hasła są identyczne oraz wywołanie `supabase.auth.signUp` odpowiada również za wysyłkę emaila aktywacyjnego zgodnie z wymaganiem z PRD.
    - Waliduje dane (sprawdzenie formatu, dopasowania haseł, ograniczenia długości).
    - Wywołuje metodę `supabase.auth.signUp`.

  - `login.ts` - logowanie użytkownika:
    - Odbiera dane: email, hasło.
    - Walidacja i autoryzacja poprzez `supabase.auth.signIn`.

  - `logout.ts` - wylogowanie użytkownika:
    - Wywołanie `supabase.auth.signOut` i niszczenie sesji.

  - `reset-password.ts` - inicjacja procedury resetowania hasła:
    - Odbiera email i wywołuje mechanizm Supabase do wysłania linku resetującego.

### 2.2. Modele danych i walidacja
- **Modele danych**: 
  - Dane użytkownika będą korzystały z domyślnej struktury Supabase, uzupełnione o ewentualne dodatkowe dane w tabelach użytkowników.
  - Typy zdefiniowane w `src/types.ts` (ewentualnie rozszerzone o nowe typy autoryzacyjne).

- **Walidacja danych**:
  - Wykorzystanie walidatorów (np. Zod) dla danych wejściowych w endpointach, by upewnić się, że spełniają wymagane kryteria (format email, minimalna długość hasła, zgodność hasła i potwierdzenia).

### 2.3. Obsługa wyjątków
- Każdy endpoint powinien implementować mechanizm obsługi błędów:
  - Używanie bloków `try-catch`.
  - Zwracanie komunikatów błędów przy pomocy jednolitego formatu API (np. JSON zawierający `error` i `message`).
  - Logowanie błędów po stronie serwera dla celów debugowania, z zachowaniem prywatności danych użytkownika.

### 2.4. Renderowanie stron server-side
- W związku z wykorzystaniem Astro:
  - Strony takie jak `login.astro`, `register.astro` oraz `reset-password.astro` będą renderowane po stronie serwera z dynamicznymi danymi przekazywanymi z API.
  - Konfiguracja w `astro.config.mjs` zapewni, że ścieżki do stron API i stron renderowanych server-side są poprawnie zmapowane.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1. Wykorzystanie Supabase Auth
- **Integracja z Supabase**:
  - Użycie wbudowanych metod Supabase Auth (`signUp`, `signIn`, `signOut`, `resetPassword`) do zarządzania autentykacją użytkowników.
  - Konfiguracja klienta Supabase w `src/db/supabase.client.ts` zapewniająca jednolity dostęp do metod autoryzacyjnych.

### 3.2. Mechanizm rejestracji i logowania
- **Rejestracja**:
  - Po poprawnie zweryfikowanych danych, wywołanie `supabase.auth.signUp` inicjujące proces rejestracji i wysłanie emaila z linkiem aktywacyjnym.

- **Logowanie**:
  - Wywołanie `supabase.auth.signIn` z danymi logowania i obsługa sesji na podstawie tokenów oraz cookies.

- **Wylogowanie**:
  - Inicjacja wywołania `supabase.auth.signOut`, kończąca sesję i usuwająca ciasteczka sesyjne.

- **Odzyskiwanie hasła**:
  - Użycie dedykowanego endpointu, który inicjuje procedurę resetowania hasła przez Supabase. Użytkownik otrzymuje email z instrukcjami resetowania.

### 3.3. Integracja z warstwą frontendową i middleware
- **Integracja z API**: 
  - Komponenty React wywołują endpointy API za pomocą fetch/axios, przekazując dane użytkownika.
  - Obsługa przekierowań po udanej autoryzacji (np. przekierowanie do strony głównej dla zalogowanych użytkowników z odpowiednią walidacją sesji).

- **Middleware**:
  - Wykorzystanie istniejącego middleware w `src/middleware/index.ts` do ochrony stron wymagających autoryzacji.
  - Middleware sprawdza obecność sesji i przekierowuje niezalogowanych użytkowników do strony logowania.

---

## Podsumowanie
Powyższa specyfikacja definiuje szczegółowy plan wdrożenia modułu autoryzacji uwzględniający:
- Modyfikacje warstwy interfejsu użytkownika - nowy zestaw stron oraz formularzy komponentów, walidacji i komunikatów błędów,
- Ustaloną strukturę endpointów API, walidację danych, obsługę wyjątków oraz mechanizmy renderowania stron server-side zgodne z Astro,
- Integrację z systemem Supabase Auth, wykorzystując wbudowane funkcje do zarządzania rejestracją, logowaniem, wylogowaniem oraz odzyskiwaniem hasła.

Implementacja tych rozwiązań będzie zgodna z obecnymi praktykami projektowymi, dbając o bezpieczeństwo, skalowalność oraz spójność architektury aplikacji.

