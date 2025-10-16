# Podsumowanie Kluczowych Ustaleń - MVP Platformy do Generowania Fiszek AI

## 1. Problem i Rozwiązanie
**Problem:** Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

**Rozwiązanie:** Platforma webowa wykorzystująca AI (GPT-4o-mini) do automatycznego generowania fiszek z tekstu źródłowego.

## 2. Grupa Docelowa
- Uczniowie i studenci
- Rynek: Polska (język polski)
- Materiały źródłowe: notatki z wykładów, artykuły, treści edukacyjne (opcjonalnie format Markdown)

## 3. Kluczowe Funkcjonalności MVP

### Generowanie Fiszek AI
- Model: GPT-4o-mini
- Typy fiszek: pytanie-odpowiedź, luki do uzupełnienia
- Tekst źródłowy: 1000-10000 słów
- Liczba fiszek:
    - 1000 słów → 10-15 fiszek
    - 10000 słów → 30-50 fiszek
- Parametry dostosowywalne przez użytkownika:
    - Liczba fiszek do wygenerowania
    - Poziom trudności

### Flow Użytkownika
1. Użytkownik wkleja tekst
2. Naciska "generuj fiszki" (z opcjonalnymi parametrami)
3. Otrzymuje listę wygenerowanych fiszek
4. Może wykonać akcje:
    - Zaakceptować pojedynczą fiszkę
    - Zaakceptować całą listę na raz
    - Edytować fiszkę
    - Usunąć fiszkę
    - Dodać fiszkę manualnie

### Zarządzanie Fiszkami
- Organizacja: użytkownik → talie → fiszki
- Użytkownik może usuwać całe talie
- Limity MVP:
    - Maksymalnie 5 nowych talii dziennie
    - Maksymalnie 10 generowań AI dziennie

### System Nauki (FSRS)
- Algorytm powtórek: FSRS (Free Spaced Repetition Scheduler)
- Działanie na poziomie całej talii (nie pojedynczych fiszek)
- Interfejs sesji nauki: karta za kartą

### Autoryzacja
- Email + hasło
- Fallback: przy braku dostępu do API AI → manualne tworzenie fiszek

## 4. Kryteria Sukcesu
1. **75% akceptacja AI:** 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika
    - Mierzenie: ilość zaakceptowanych fiszek vs wygenerowanych na podsatwie logów z tabeli


## 5. Poza Zakresem MVP
- Własny zaawansowany algorytm powtórek
- Import PDF, DOCX i innych formatów
- Współdzielenie zestawów między użytkownikami
- Integracje z platformami edukacyjnymi
- Aplikacje mobilne
- Eksport do innych formatów (Anki, CSV)
- Weryfikacja email i reset hasła
- Email reminders o powtórkach
- Dashboard ze statystykami

## 6. Model Biznesowy
- MVP: całkowicie darmowy
- Brak ograniczeń budżetowych na API

## 7. Parametry Projektu
- **Timeline:** 4 tygodnie
- **Bariery adopcji:** brak zidentyfikowanych
- **Strategia uruchomienia:** soft launch z zamkniętą betą dla 10-20 użytkowników

## 8. Wymagania Techniczne (do ustalenia)
- Stack technologiczny (frontend, backend, baza danych, hosting)
- Schemat bazy danych z tabelami dla users, decks, flashcards

## 9. Otwarte Kwestie Wymagające Doprecyzowania
1. Dokładny interfejs sesji nauki (jak użytkownik ocenia znajomość: pamiętam/nie pamiętam, Again/Hard/Good/Easy?)
2. Ekran główny po zalogowaniu (lista talii, dashboard?)
3. Proces nazywania talii (automatycznie z tytułu tekstu czy manualnie?)
4. Minimalne dane rejestracji (tylko email/hasło czy więcej?)
5. Zbieranie statystyk nauki użytkownika (liczba powtórek, retention, czas nauki?)
6. Stack technologiczny i zespół projektowy

## 10. Priorytetowe Rekomendacje
1. Przygotować zestaw przykładów "dobrych" i "złych" fiszek dla prompt engineering
2. Zdefiniować 3 poziomy trudności z jasnymi definicjami
3. Stworzyć exact prompt template dla GPT-4o-mini
4. Zaprojektować schemat bazy danych przed rozpoczęciem development
5. Utworzyć MVP feature scope matrix (must/should/could/won't have)

---

**Następny krok:** Stworzenie pełnego dokumentu PRD z wykorzystaniem powyższych ustaleń.