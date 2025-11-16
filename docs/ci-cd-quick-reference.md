# CI/CD Quick Reference

## 🚀 Szybki Start

### Uruchomienie Manualne

1. Przejdź do [Actions](../../actions)
2. Wybierz **CI/CD Pipeline**
3. Kliknij **Run workflow** → **Run workflow**

### Sprawdzenie Statusu

```bash
# Lokalnie przed pushem
npm run lint          # ESLint
npm run test          # Vitest (unit tests)
npm run test:e2e      # Playwright (E2E tests)
npm run build         # Production build
```

## 📊 Pipeline Overview

| Job | Czas | Opis |
|-----|------|------|
| **Lint & Unit Tests** | ~2-3 min | ESLint + Vitest |
| **E2E Tests** | ~5-10 min | Playwright (Chromium) |
| **Production Build** | ~3-5 min | Astro build + artifacts |
| **Summary** | <1 min | Podsumowanie wyników |

**Całkowity czas:** ~10-15 minut

## 🎯 Triggery

| Trigger | Kiedy | Branch |
|---------|-------|--------|
| **Push** | Automatycznie | `master` |
| **Pull Request** | Automatycznie | → `master` |
| **Manual** | Na żądanie | Dowolny |

## 📦 Artefakty

| Nazwa | Retencja | Zawartość |
|-------|----------|-----------|
| `coverage-report` | 7 dni | HTML report z coverage |
| `playwright-report` | 30 dni | E2E test results + screenshots |
| `dist` | 7 dni | Production build |

## ✅ Checklist przed Push

```bash
# 1. Sprawdź linting
npm run lint:fix

# 2. Uruchom testy jednostkowe
npm run test

# 3. Sprawdź build
npm run build

# 4. (Opcjonalnie) Uruchom E2E lokalnie
npm run test:e2e
```

## 🔧 Komendy Pomocnicze

```bash
# Sprawdź status ostatniego workflow (wymaga gh CLI)
gh run list --workflow=ci-cd.yml --limit 1

# Pobierz logi ostatniego uruchomienia
gh run view --log

# Pobierz artefakt
gh run download <run-id> -n dist
```

## 🐛 Szybkie Rozwiązania

### ❌ Lint Failed
```bash
npm run lint:fix
git add .
git commit -m "fix: resolve linting issues"
git push
```

### ❌ Unit Tests Failed
```bash
npm run test:watch  # Uruchom w trybie watch
# Napraw testy
npm run test        # Zweryfikuj
```

### ❌ E2E Tests Failed
```bash
npm run test:e2e:ui  # Uruchom Playwright UI
# Sprawdź failing tests
# Napraw i zweryfikuj lokalnie
```

### ❌ Build Failed
```bash
npm run build
# Sprawdź błędy kompilacji
# Napraw i zweryfikuj
```

## 📈 Status Badge

Dodaj do README.md:

```markdown
![CI/CD Status](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml/badge.svg)
```

## 🔗 Przydatne Linki

- [Pełna dokumentacja CI/CD](./ci-cd-setup.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)

## 💡 Tips

- ⚡ Pipeline automatycznie anuluje poprzednie uruchomienia przy nowym pushu
- 📦 Artefakty są dostępne w zakładce Actions → konkretny run
- 🎯 Summary jest generowane automatycznie po każdym uruchomieniu
- 🔄 Cache npm przyspiesza instalację zależności
- 🌐 Tylko Chromium jest instalowany dla Playwright (oszczędność czasu)

---

**Potrzebujesz pomocy?** Zobacz [pełną dokumentację](./ci-cd-setup.md)

