# Dokument wymagań produktu (PRD) - Platforma AI do Generowania Fiszek

## 1. Przegląd produktu
Produkt to platforma webowa umożliwiająca automatyczne generowanie fiszek edukacyjnych przy użyciu modelu AI (GPT-4o-mini). Głównym celem jest ułatwienie nauki metodą spaced repetition poprzez:
- Automatyczne generowanie fiszek na podstawie wprowadzonego tekstu.
- Umożliwienie ręcznego tworzenia fiszek.
- Zarządzanie fiszkami w obrębie talii (grup fiszek przypisanych do użytkownika).
- Umożliwienie prowadzenia sesji nauki przy wykorzystaniu algorytmu FSRS.

Platforma adresowana jest przede wszystkim do uczniów i studentów, głównie w języku polskim.

## 2. Problem użytkownika
Użytkownicy często zmagają się z czasochłonnym zadaniem ręcznego tworzenia wysokiej jakości fiszek, które są niezbędne do skutecznego zapamiętywania materiału. Manualne tworzenie fiszek:
- Jest czasochłonne i wymaga dużego nakładu pracy.
- Zniechęca do korzystania z metody spaced repetition mimo jej skuteczności.
- Ogranicza możliwość szybkiego i efektywnego przetwarzania dużej ilości materiału edukacyjnego.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przy użyciu AI:
   - Użytkownik wkleja tekst (zakres od 1000 do 10000 słów).
   - Użytkownik określa liczbę fiszek do wygenerowania oraz poziom trudności.
   - Model powinien wygenerować:
     - Fiszki pytanie-odpowiedź.
     - Fiszki z lukami do uzupełnienia.
   - Przykładowe przeliczenie: dla 1000 słów – 10-15 fiszek, dla 10000 słów – 30-50 fiszek.
2. Ręczne tworzenie fiszek:
   - Użytkownik może dodawać fiszki manualnie.
3. Przeglądanie, edycja i usuwanie fiszek:
   - Użytkownik może przeglądać listę fiszek, edytować istniejące lub usuwać niechciane.
4. Zarządzanie strukturą:
   - Każdy użytkownik posiada swoje konto.
   - Fiszki są zorganizowane w talie; użytkownik może tworzyć oraz usuwać talie.
   - Ograniczenia MVP: maksymalnie 5 nowych talii dziennie oraz 10 generacji AI dziennie.
5. System nauki:
   - Zastosowanie algorytmu FSRS, który operuje na poziomie talii.
   - Sesja nauki to przegląd fiszki jedna po drugiej.
6. Uwierzytelnianie i autoryzacja:
   - Rejestracja oraz logowanie przy użyciu adresu email i hasła.
   - W sytuacji braku dostępu do API AI przewidziana jest możliwość ręcznego tworzenia fiszek.

## 4. Granice produktu
Produkt w MVP nie obejmuje funkcjonalności, które mogą być rozwijane w kolejnych iteracjach. Do elementów poza zakresem projektu należą:
- Własny, zaawansowany algorytm powtórek (np. SuperMemo, Anki).
- Import plików w formatach PDF, DOCX i innych.
- Współdzielenie fiszek między użytkownikami oraz integracje z zewnętrznymi platformami edukacyjnymi.
- Rozwój aplikacji mobilnych – wersja webowa na początek.
- Eksport danych (np. do plików CSV czy do Anki).
- Rozbudowane funkcje weryfikacji (np. reset hasła, email reminders, dashboard statystyk).

## 5. Historyjki użytkowników

### US-001
ID: US-001  
Tytuł: Rejestracja i logowanie użytkownika  
Opis: Jako nowy użytkownik chcę móc zarejestrować się i zalogować przy użyciu adresu email oraz hasła, aby uzyskać dostęp do funkcjonalności platformy.  
Kryteria akceptacji:
- Użytkownik może rejestrować się, podając unikalny adres email i hasło.
- Po rejestracji użytkownik otrzymuje potwierdzenie i może zalogować się.
- System zapewnia poprawne zarządzanie sesją użytkownika.

### US-002
ID: US-002  
Tytuł: Generowanie fiszek przy użyciu AI  
Opis: Jako użytkownik chcę wprowadzić tekst źródłowy oraz ustawić parametry (liczbę fiszek, poziom trudności) i wygenerować fiszki przy użyciu AI, aby szybko uzyskać spersonalizowane materiału edukacyjne.  
Kryteria akceptacji:
- Użytkownik wprowadza tekst oraz parametry w interfejsie.
- System wywołuje funkcję generowania AI i w odpowiednim czasie prezentuje listę wygenerowanych fiszek.
- Wygenerowane fiszki odpowiadają ustalonym limitom (10–15 dla 1000 znaków, 30–50 dla 10000 znaków).
- Użytkownik może zaakceptować pojedynczą fiszkę lub całą listę.

### US-003
ID: US-003  
Tytuł: Ręczne tworzenie fiszek  
Opis: Jako użytkownik chcę móc samodzielnie tworzyć fiszki, aby mieć pełną kontrolę nad treścią wraz z możliwością edycji i usuwania.  
Kryteria akceptacji:
- Interfejs umożliwia dodanie nowej fiszki z pełną możliwością edycji treści.
- Użytkownik może zapisać nowo utworzoną fiszkę oraz później ją edytować lub usunąć.
- Podczas tworzenia fiszki ręcznie powinna być weryfikacja dlugosci `front` (maksymalnie 200 znaków), `back` (maksymalnie 500 znaków), `source` powinien być ustawiony jako `manual`

### US-004
ID: US-004  
Tytuł: Przeglądanie i zarządzanie fiszkami w ramach talii  
Opis: Jako użytkownik chcę móc przeglądać fiszki pogrupowane w talie, aby łatwo odnaleźć i zarządzać materiałem edukacyjnym.  
Kryteria akceptacji:
- Fiszki są wyświetlane w kontekście talie, do której należą.
- Użytkownik może edytować, usuwać lub przenosić fiszki między taliami.
- System wprowadza limit 5 nowych talii dziennie.

### US-005
ID: US-005  
Tytuł: Rozpoczęcie sesji nauki z algorytmem FSRS  
Opis: Jako użytkownik chcę rozpocząć sesję nauki, która prezentuje fiszki jedna po drugiej według algorytmu FSRS, aby zoptymalizować proces zapamiętywania.  
Kryteria akceptacji:
- Użytkownik wybiera talię do nauki.
- System uruchamia sesję nauki z algorytmem FSRS.
- Fiszki są prezentowane pojedynczo z opcjami oceny (np. utrzymanie poziomu trudności: Again/Hard/Good/Easy).
- Wyniki sesji są zapisywane w systemie.

### US-006
ID: US-006  
Tytuł: Obsługa limitów dziennej aktywności  
Opis: Jako użytkownik chcę, aby system monitorował i ograniczał liczbę nowych talii i generacji AI w ciągu dnia, tak aby zapobiec nadużyciom i zapewnić stabilność serwisu.  
Kryteria akceptacji:
- System odnotowuje liczbę generacji AI dla danego użytkownika.
- Użytkownik otrzymuje informację, gdy osiągnie limit (maksymalnie 10 generacji AI lub 5 nowych talii dziennie).

### US-007
ID: US-007  
Tytuł: Reagowanie na błąd dostępu do API AI  
Opis: Jako użytkownik chcę, aby w przypadku braku dostępu do API AI system umożliwił ręczne wprowadzanie fiszek, zapewniając ciągłość pracy.  
Kryteria akceptacji:
- System wykrywa awarię API AI.
- Interfejs przedstawia użytkownikowi możliwość ręcznego dodawania fiszek.
- Proces ręcznego tworzenia fiszek działa bez zakłóceń.

## 6. Metryki sukcesu
1. 75-procentowa akceptacja fiszek wygenerowanych przez AI:
   - Mierzenie: stosunek zaakceptowanych fiszek do wszystkich wygenerowanych, monitorowany poprzez logi.
2. Wysoki odsetek interakcji użytkowników z funkcjonalnością AI:
   - Cel: co najmniej 75% fiszek powinno być generowanych przez AI.
3. Stabilność systemu:
   - Utrzymanie dziennych limitów (maks. 10 generacji AI i 5 nowych talii dziennie) bez przekroczeń.
4. Pozytywna ocena użyteczności systemu:
   - Ankiety użytkowników po sesjach nauki oraz analiza danych o czasie spędzonym w aplikacji.
