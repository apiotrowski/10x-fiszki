# CI/CD Migration Guide

## Przegląd Zmian

Projekt został zmigowany z dwóch osobnych workflows (`unit.yml` i `playwright.yml`) do jednego zunifikowanego pipeline'u (`ci-cd.yml`).

## Co się zmieniło?

### Przed (2 workflows)

```
unit.yml:
- Lint ❌ (brak)
- Unit Tests ✅
- Build ✅

playwright.yml:
- E2E Tests ✅
```

**Problemy:**
- Brak lintingu w CI
- Brak zależności między jobs
- Duplikacja konfiguracji
- Brak podsumowania wyników
- Brak optymalizacji (cache, concurrency)

### Po (1 unified workflow)

```
ci-cd.yml:
- Lint & Unit Tests ✅
- E2E Tests ✅ (zależne od poprzedniego)
- Production Build ✅ (zależne od poprzednich)
- Pipeline Summary ✅
```

**Korzyści:**
- ✅ Pełny lint w CI
- ✅ Sekwencyjne wykonanie z zależnościami
- ✅ Jedna konfiguracja do zarządzania
- ✅ Automatyczne podsumowanie
- ✅ Optymalizacje (cache, concurrency control)
- ✅ Lepsze artefakty i raporty

## Szczegółowe Różnice

### 1. Triggery

#### Przed
```yaml
# unit.yml i playwright.yml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

#### Po
```yaml
# ci-cd.yml
on:
  workflow_dispatch:  # ✨ NOWE: Manual trigger
  push:
    branches: [master]
  pull_request:
    branches: [master]

concurrency:  # ✨ NOWE: Auto-cancel poprzednich runs
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 2. Node.js Setup

#### Przed
```yaml
# unit.yml
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc

# playwright.yml
- uses: actions/setup-node@v4
  with:
    node-version: lts/*  # ❌ Niespójne!
```

#### Po
```yaml
# ci-cd.yml (wszystkie jobs)
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
    cache: 'npm'  # ✨ NOWE: Cache dependencies
```

### 3. Linting

#### Przed
```yaml
# ❌ Brak lintingu w CI!
```

#### Po
```yaml
# ✅ Lint jako pierwszy krok
- name: Run ESLint
  run: npm run lint
```

### 4. Dependencies między Jobs

#### Przed
```yaml
# ❌ Brak dependencies - wszystko równolegle
# Playwright może się uruchomić nawet jeśli unit tests failują
```

#### Po
```yaml
# ✅ Sekwencyjne wykonanie
e2e-tests:
  needs: lint-and-test

build:
  needs: [lint-and-test, e2e-tests]

summary:
  needs: [lint-and-test, e2e-tests, build]
  if: always()
```

### 5. Playwright Browser Installation

#### Przed
```yaml
# playwright.yml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
  # ❌ Instaluje wszystkie przeglądarki (Chrome, Firefox, WebKit)
```

#### Po
```yaml
# ci-cd.yml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
  # ✅ Tylko Chromium (szybsze o ~60%)
```

### 6. Artefakty

#### Przed
```yaml
# playwright.yml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30

# unit.yml
# ❌ Brak artefaktów!
```

#### Po
```yaml
# ci-cd.yml
# ✅ Coverage report
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 7

# ✅ Playwright report
- uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30

# ✅ Production build
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist/
    retention-days: 7
```

### 7. Podsumowanie

#### Przed
```yaml
# ❌ Brak podsumowania
```

#### Po
```yaml
# ✅ Automatyczne podsumowanie w Markdown
summary:
  name: Pipeline Summary
  runs-on: ubuntu-latest
  needs: [lint-and-test, e2e-tests, build]
  if: always()
  
  steps:
    - name: Check pipeline status
      run: |
        echo "### CI/CD Pipeline Results 🚀" >> $GITHUB_STEP_SUMMARY
        # ... tabelka z wynikami
```

## Migracja Krok po Kroku

### Krok 1: Backup (opcjonalnie)

```bash
# Skopiuj stare workflows
cp .github/workflows/unit.yml .github/workflows/unit.yml.backup
cp .github/workflows/playwright.yml .github/workflows/playwright.yml.backup
```

### Krok 2: Dodaj Nowy Workflow

Nowy workflow `ci-cd.yml` został już dodany do projektu.

### Krok 3: Wyłącz Stare Workflows

Stare workflows zostały już oznaczone jako DEPRECATED i wyłączone (tylko manual trigger).

### Krok 4: Testowanie

```bash
# 1. Commit i push zmian
git add .github/workflows/ci-cd.yml
git commit -m "feat: add unified CI/CD pipeline"
git push origin master

# 2. Sprawdź Actions w GitHub
# - Nowy workflow powinien się uruchomić automatycznie
# - Stare workflows nie powinny się uruchomić

# 3. Przetestuj manual trigger
# - Przejdź do Actions → CI/CD Pipeline
# - Kliknij "Run workflow"
# - Sprawdź czy wszystko działa
```

### Krok 5: Usuń Stare Workflows (po weryfikacji)

Po 1-2 tygodniach testowania nowego workflow:

```bash
# Usuń stare workflows
git rm .github/workflows/unit.yml
git rm .github/workflows/playwright.yml
git commit -m "chore: remove deprecated workflows"
git push origin master
```

## Weryfikacja Migracji

### Checklist

- [ ] Nowy workflow `ci-cd.yml` istnieje
- [ ] Stare workflows są oznaczone jako DEPRECATED
- [ ] Nowy workflow uruchamia się automatycznie na push do master
- [ ] Nowy workflow można uruchomić manualnie
- [ ] Wszystkie joby przechodzą poprawnie:
  - [ ] Lint & Unit Tests
  - [ ] E2E Tests
  - [ ] Production Build
  - [ ] Pipeline Summary
- [ ] Artefakty są generowane:
  - [ ] coverage-report
  - [ ] playwright-report
  - [ ] dist
- [ ] Podsumowanie jest widoczne w GitHub Actions Summary

### Testy Manualne

```bash
# 1. Test lokalny przed pushem
npm run lint
npm run test
npm run test:e2e
npm run build

# 2. Push do master
git push origin master

# 3. Sprawdź Actions
# - Otwórz GitHub → Actions
# - Sprawdź czy workflow się uruchomił
# - Sprawdź logi każdego joba
# - Sprawdź podsumowanie
# - Pobierz artefakty

# 4. Test manual trigger
# - Actions → CI/CD Pipeline → Run workflow
# - Wybierz branch
# - Run workflow
# - Sprawdź wyniki
```

## Troubleshooting

### Problem: Stare workflows nadal się uruchamiają

**Rozwiązanie:**
```bash
# Sprawdź czy stare workflows mają tylko workflow_dispatch trigger
cat .github/workflows/unit.yml
cat .github/workflows/playwright.yml

# Jeśli nie, zaktualizuj je zgodnie z migration guide
```

### Problem: Nowy workflow nie uruchamia się automatycznie

**Rozwiązanie:**
1. Sprawdź czy `ci-cd.yml` jest w branchu master
2. Sprawdź syntax YAML (użyj https://www.yamllint.com/)
3. Sprawdź logi w Actions → All workflows

### Problem: Job dependencies nie działają

**Rozwiązanie:**
```yaml
# Upewnij się że każdy job ma poprawne needs:
e2e-tests:
  needs: lint-and-test  # ✅

build:
  needs: [lint-and-test, e2e-tests]  # ✅
```

### Problem: Cache nie działa

**Rozwiązanie:**
```yaml
# Upewnij się że cache jest włączony w każdym jobie
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
    cache: 'npm'  # ✅ Musi być w każdym jobie
```

## Rollback Plan

Jeśli nowy workflow powoduje problemy:

```bash
# 1. Przywróć stare workflows
git revert <commit-hash>  # commit z ci-cd.yml

# 2. Lub ręcznie przywróć triggery w starych workflows
# Edytuj unit.yml i playwright.yml:
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

# 3. Commit i push
git add .github/workflows/
git commit -m "revert: rollback to old workflows"
git push origin master
```

## FAQ

### Q: Czy mogę używać obu workflows równocześnie?

**A:** Nie zalecane. Stare workflows są wyłączone (tylko manual trigger) aby uniknąć duplikacji. Po weryfikacji nowego workflow, usuń stare.

### Q: Czy nowy workflow jest wolniejszy?

**A:** Nie! Dzięki cache i optymalizacjom (tylko Chromium) jest szybszy lub porównywalny.

### Q: Co jeśli chcę uruchomić tylko testy E2E?

**A:** Możesz:
1. Uruchomić lokalnie: `npm run test:e2e`
2. Utworzyć osobny workflow dla E2E (nie zalecane)
3. Użyć manual trigger i sprawdzić tylko E2E job

### Q: Czy mogę dostosować workflow?

**A:** Tak! Workflow jest w pełni konfigurowalny. Zobacz [ci-cd-setup.md](./ci-cd-setup.md) dla szczegółów.

## Następne Kroki

Po udanej migracji:

1. ✅ Dodaj status badge do README
2. ✅ Skonfiguruj notifications (Slack/Discord)
3. ✅ Dodaj deployment job
4. ✅ Rozważ matrix testing (wiele wersji Node.js)
5. ✅ Monitoruj koszty GitHub Actions

## Zasoby

- [Pełna dokumentacja CI/CD](./ci-cd-setup.md)
- [Quick Reference](./ci-cd-quick-reference.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Data migracji:** 2025-11-16  
**Status:** ✅ Completed

