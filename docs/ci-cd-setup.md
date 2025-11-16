# CI/CD Setup Documentation

## Przegląd

Projekt wykorzystuje GitHub Actions do automatyzacji procesów testowania i budowania aplikacji. Pipeline CI/CD zapewnia, że każda zmiana w kodzie przechodzi przez kompletny zestaw testów przed wdrożeniem.

## Architektura Pipeline

### Workflow: `ci-cd.yml`

Główny workflow CI/CD składa się z 4 zadań (jobs) wykonywanych sekwencyjnie:

```
┌─────────────────────┐
│  Lint & Unit Tests  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    E2E Tests        │
│   (Playwright)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Production Build   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Pipeline Summary   │
└─────────────────────┘
```

## Triggery

Pipeline uruchamia się automatycznie w następujących sytuacjach:

### 1. **Push do brancha `master`**
```yaml
push:
  branches: [master]
```

### 2. **Pull Request do brancha `master`**
```yaml
pull_request:
  branches: [master]
```

### 3. **Ręczne uruchomienie (Manual Trigger)**
```yaml
workflow_dispatch:
```

Aby uruchomić manualnie:
1. Przejdź do zakładki **Actions** w repozytorium GitHub
2. Wybierz workflow **CI/CD Pipeline**
3. Kliknij **Run workflow**
4. Wybierz branch i potwierdź

## Szczegóły Zadań (Jobs)

### Job 1: Lint & Unit Tests

**Czas wykonania:** ~2-3 minuty

**Wykonywane kroki:**
1. ✅ Checkout kodu
2. ✅ Setup Node.js (wersja z `.nvmrc`)
3. ✅ Instalacja zależności (`npm ci`)
4. ✅ Uruchomienie ESLint (`npm run lint`)
5. ✅ Uruchomienie testów jednostkowych Vitest (`npm run test`)
6. ✅ Upload raportu coverage (opcjonalnie)

**Cel:** Weryfikacja jakości kodu i poprawności logiki biznesowej.

### Job 2: E2E Tests (Playwright)

**Czas wykonania:** ~5-10 minut  
**Timeout:** 60 minut  
**Zależności:** Wymaga sukcesu Job 1

**Wykonywane kroki:**
1. ✅ Checkout kodu
2. ✅ Setup Node.js
3. ✅ Instalacja zależności
4. ✅ Instalacja przeglądarki Chromium dla Playwright
5. ✅ Uruchomienie testów E2E (`npm run test:e2e`)
6. ✅ Upload raportu Playwright (zawsze, nawet przy błędach)

**Cel:** Weryfikacja krytycznych ścieżek użytkownika w działającej aplikacji.

**Uwaga:** Playwright automatycznie uruchamia dev server przed testami (konfiguracja w `playwright.config.ts`).

### Job 3: Production Build

**Czas wykonania:** ~3-5 minut  
**Zależności:** Wymaga sukcesu Job 1 i Job 2

**Wykonywane kroki:**
1. ✅ Checkout kodu
2. ✅ Setup Node.js
3. ✅ Instalacja zależności
4. ✅ Build produkcyjny (`npm run build`)
5. ✅ Upload artefaktów build (folder `dist/`)
6. ✅ Raport rozmiaru build

**Cel:** Weryfikacja, że aplikacja kompiluje się poprawnie w trybie produkcyjnym.

**Artefakty:** Build jest dostępny przez 7 dni w zakładce Actions.

### Job 4: Pipeline Summary

**Czas wykonania:** <1 minuta  
**Zależności:** Wykonuje się zawsze po zakończeniu wszystkich jobs  
**Warunek:** `if: always()` - działa nawet jeśli poprzednie joby zawiodą

**Wykonywane kroki:**
1. ✅ Generowanie podsumowania w formacie Markdown
2. ✅ Wyświetlenie statusu wszystkich jobs
3. ✅ Zwrócenie exit code (0 = sukces, 1 = błąd)

**Cel:** Przejrzyste podsumowanie wyników pipeline w GitHub Actions Summary.

## Optymalizacje

### 1. **Concurrency Control**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
Automatyczne anulowanie poprzednich uruchomień przy nowym pushu do tego samego brancha.

### 2. **Cache Dependencies**
```yaml
uses: actions/setup-node@v4
with:
  cache: 'npm'
```
Cachowanie `node_modules` przyspiesza instalację zależności.

### 3. **Selective Browser Installation**
```bash
npx playwright install --with-deps chromium
```
Instalacja tylko przeglądarki Chromium zamiast wszystkich (Firefox, WebKit).

### 4. **Conditional Artifact Upload**
```yaml
if: always()
```
Raporty testów są uploadowane nawet przy błędach, co ułatwia debugging.

## Wymagania Środowiskowe

### Zmienne Środowiskowe

Pipeline używa następujących zmiennych:

| Zmienna | Źródło | Użycie |
|---------|--------|--------|
| `CI` | GitHub Actions (auto) | Wykrywanie środowiska CI |
| `NODE_ENV` | Ustawiane w workflow | Tryb produkcyjny dla build |

### Secrets (dla przyszłych rozszerzeń)

Jeśli potrzebujesz dodać secrets (np. dla Supabase, OpenRouter):

1. Przejdź do **Settings** → **Secrets and variables** → **Actions**
2. Dodaj nowy secret
3. Użyj w workflow:
```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Monitoring i Debugging

### Gdzie znaleźć logi?

1. Przejdź do zakładki **Actions** w repozytorium
2. Wybierz konkretne uruchomienie workflow
3. Kliknij na job, który chcesz sprawdzić
4. Rozwiń poszczególne kroki

### Artefakty

Pipeline generuje następujące artefakty:

| Artefakt | Retencja | Opis |
|----------|----------|------|
| `coverage-report` | 7 dni | Raport pokrycia testami jednostkowymi |
| `playwright-report` | 30 dni | Raport testów E2E z screenshotami |
| `dist` | 7 dni | Build produkcyjny aplikacji |

### GitHub Actions Summary

Po każdym uruchomieniu dostępne jest podsumowanie w formacie Markdown:

```markdown
### CI/CD Pipeline Results 🚀

| Job | Status |
|-----|--------|
| Lint & Unit Tests | success |
| E2E Tests | success |
| Production Build | success |

✅ **All checks passed!** Ready for deployment.
```

## Rozwiązywanie Problemów

### Problem: Testy E2E timeout

**Rozwiązanie:**
- Zwiększ timeout w `playwright.config.ts`
- Sprawdź czy dev server startuje poprawnie
- Zweryfikuj czy testy nie czekają na nieistniejące elementy

### Problem: Build fails

**Rozwiązanie:**
- Sprawdź logi buildu w Actions
- Uruchom `npm run build` lokalnie
- Zweryfikuj czy wszystkie zmienne środowiskowe są ustawione

### Problem: Lint errors

**Rozwiązanie:**
- Uruchom `npm run lint:fix` lokalnie
- Commit i push poprawek
- Upewnij się, że ESLint config jest aktualny

## Przyszłe Rozszerzenia

### Deployment

Możesz dodać job deployment po sukcesie buildu:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/master'
  
  steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: dist
    
    - name: Deploy to Vercel/Netlify/etc
      run: # deployment commands
```

### Notifications

Dodaj notyfikacje Slack/Discord:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Matrix Testing

Testowanie na wielu wersjach Node.js:

```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]
```

## Koszty i Limity

### GitHub Actions - Free Tier

- **2,000 minut/miesiąc** dla repozytoriów prywatnych
- **Unlimited** dla repozytoriów publicznych
- Ubuntu runner: 1x multiplier

### Szacowany czas pipeline

- **Pełny pipeline:** ~10-15 minut
- **Miesięczny koszt (20 uruchomień):** ~200-300 minut

## Best Practices

1. ✅ **Zawsze uruchamiaj testy lokalnie przed pushem**
2. ✅ **Używaj `npm ci` zamiast `npm install` w CI**
3. ✅ **Cachuj zależności dla szybszych buildów**
4. ✅ **Uploaduj artefakty dla łatwiejszego debugowania**
5. ✅ **Używaj `if: always()` dla raportów testów**
6. ✅ **Monitoruj czas wykonania jobs**
7. ✅ **Regularnie aktualizuj actions do najnowszych wersji**

## Kontakt i Wsparcie

W razie problemów z CI/CD:
1. Sprawdź logi w GitHub Actions
2. Przejrzyj dokumentację GitHub Actions
3. Zweryfikuj konfigurację lokalnie

---

**Ostatnia aktualizacja:** 2025-11-16  
**Wersja workflow:** 1.0.0

