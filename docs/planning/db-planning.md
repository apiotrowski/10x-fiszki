<conversation_summary>
<decisions>
Encja „users” powinna pochodzić z bazy danych supabase (auth.users).
Encja „decks” zostanie powiązana z użytkownikami i będzie zawierać dodatkowe informacje, takie jak metadane dotyczące zarządzania zawartością oraz historią modyfikacji.
Encja „flashcards” będzie posiadać pole "type" z wartościami "question-answer" oraz "gaps", dla rozróżnienia typów fiszek. Dodatkowo powinna zawierać pole source, z kluczami (ai-full, ai-edited, manual). Pola dla określenia question and answer, powinny być określone odpowiednio jako "front" (varchar 200) i "back" (varchar 500).
Dedykowana encja sesji nauki nie jest na tym etapie tworzona, ale pozostaje w planach na przyszłość.
Na potrzeby zbierania informacji o statystykach generowania fiszki, potrzeba utworzyć encję "generations" z polami odzwierciedlajacymi informacje o: uzytkowniku, wykorzystanym modelu, ilości generowań, czasie generowania.
Relacje bazy danych będą oparte na ograniczeniach integralności: tabela „users” jako klucz obcy w tabeli „deck”, oraz każdy deck jako klucz obcy w tabeli „flashcards”.  Dodatkowo "users" jako klucz obcy w tabeli "generations".
Indeksowanie zostanie wdrożone poprzez indeksy na polach używanych w zapytaniach, w tym potencjalne indeksy pełnotekstowe dla wyszukiwania treści fiszek.
Dla przechowywania niestandardowych informacji zostanie użyty typ danych JSONB.
Mechanizmy bezpieczeństwa na poziomie wierszy (RLS) oraz skalowanie/partycjonowanie tabel nie są obecnie wymagane.
Kady uytkownik powinien być skojarzony z tabelą generate
</decisions>
<matched_recommendations>
Zaleca się rozszerzenie encji „użytkownicy” o dane uwierzytelniające oraz liczniki limitów.
Powiązanie tabeli „talie” z użytkownikami i uwzględnienie metadanych.
Dodanie pola „type” w tabeli „flashcards” dla rozróżnienia typów fiszek.
Zastosowanie ograniczeń integralności, w tym kluczy głównych i obcych, aby zapewnić spójność danych.
Wdrożenie indeksów optymalizujących zapytania, w tym indeksów pełnotekstowych.
Użycie typu JSONB dla elastycznego przechowywania niestandardowych informacji.
</matched_recommendations>
<database_planning_summary>
Główne wymagania dotyczące schematu bazy danych obejmują przechowywanie danych uwierzytelniających użytkowników wraz z limitami dziennymi, zarządzanie taliami fiszek powiązanymi z użytkownikami oraz wsparcie dla różnych typów fiszek. Kluczowe encje to:
Użytkownicy („users”) – powinna być uzyta tabela auth.users, która jest utorzona domyślnie w Supabase i wykorzystywane przez mechanizm auth.
Talie („decks”) – powiązane z użytkownikami, zawierające metadane do zarządzania zawartością i historią zmian.
Fiszki („flashcards”) – powiązane z taliami, z dodatkowym polem „type” rozróżniającym fiszki typu question-answer oraz gaps.
Generators ("generators") - powiązane z uzytkownikiem 
Ważne kwestie bezpieczeństwa obejmują stosowanie ograniczeń integralności oraz odpowiednie indeksowanie, co poprawi wydajność systemu. Mechanizmy RLS, skalowania czy specjalnych strategii backupu nie są na tym etapie wymagane. Projekt ma być zoptymalizowany pod kątem prostoty i wydajności zgodnie z wymaganiami MVP.
Istotne aspekty bezpieczeństwa i skalowalności są ograniczone do utrzymania spójności danych i wydajności zapytań przez stosowanie kluczy obcych i indeksowania, bez wdrażania dodatkowych mechanizmów RLS czy skalowania horyzontalnego.
</database_planning_summary>
<unresolved_issues>
Obecnie nie ma nierozwiązanych kwestii – wszystkie kluczowe decyzje dotyczące encji, relacji i ograniczeń integralności zostały ustalone, a dodatkowe funkcjonalności (np. encja sesji nauki, mechanizmy RLS) są zaplanowane na przyszłość.
</unresolved_issues>
</conversation_summary>