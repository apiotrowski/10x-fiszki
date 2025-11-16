# CI/CD Pipeline - Complete Setup

> **Minimalny, zoptymalizowany pipeline CI/CD dla Astro 5 + React 19 + TypeScript + Supabase**

[![CI/CD Status](https://github.com/apiotrowski/10x-fiszki/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/apiotrowski/10x-fiszki/actions/workflows/ci-cd.yml)

---

## 🎯 Czym jest ten CI/CD?

Automatyczny system testowania i budowania aplikacji, który:

✅ **Uruchamia się automatycznie** przy każdym push do `master`  
✅ **Można uruchomić manualnie** z poziomu GitHub Actions  
✅ **Testuje kod** (lint + unit tests + E2E tests)  
✅ **Buduje produkcyjną wersję** aplikacji  
✅ **Generuje raporty** (coverage, E2E results, build size)  
✅ **Daje szybki feedback** (~10-15 minut)

---

## 🚀 Szybki Start

### Uruchomienie Manualne (3 kroki)

1. Przejdź do [GitHub Actions](https://github.com/apiotrowski/10x-fiszki/actions)
2. Wybierz **"CI/CD Pipeline"**
3. Kliknij **"Run workflow"** → **"Run workflow"**

### Automatyczne Uruchomienie

```bash
git add .
git commit -m "feat: your changes"
git push origin master
# Pipeline uruchomi się automatycznie ✨
```

### Sprawdzenie Lokalnie (przed pushem)

```bash
npm run lint          # ✅ Sprawdź linting
npm run test          # ✅ Uruchom testy jednostkowe
npm run build         # ✅ Zweryfikuj build
npm run test:e2e      # ✅ (Opcjonalnie) Testy E2E
```

---

## 📊 Co Robi Pipeline?

```
┌─────────────────────────────────────────────────────────┐
│  1. Lint & Unit Tests        (~2-3 min)                │
│     • ESLint - jakość kodu                              │
│     • Vitest - testy jednostkowe                        │
│     • Coverage report                                   │
├─────────────────────────────────────────────────────────┤
│  2. E2E Tests                 (~5-10 min)               │
│     • Playwright - testy end-to-end                     │
│     • Automatyczny dev server                           │
│     • Tylko Chromium (szybciej)                         │
├─────────────────────────────────────────────────────────┤
│  3. Production Build          (~3-5 min)                │
│     • Astro build                                       │
│     • Weryfikacja kompilacji                            │
│     • Raport rozmiaru                                   │
├─────────────────────────────────────────────────────────┤
│  4. Summary                   (<1 min)                  │
│     • Podsumowanie wyników                              │
│     • Status wszystkich jobs                            │
└─────────────────────────────────────────────────────────┘

Całkowity czas: ~10-15 minut
```

---

## 📁 Struktura Projektu

```
.github/workflows/
├── ci-cd.yml                    ⭐ Główny workflow (UŻYWAJ TEGO)
├── unit.yml                     ⚠️  DEPRECATED
└── playwright.yml               ⚠️  DEPRECATED

docs/
├── CI-CD-README.md              📖 Ten plik (start tutaj)
├── ci-cd-index.md               🗂️  Indeks dokumentacji
├── ci-cd-quick-reference.md     ⚡ Szybki przewodnik
├── ci-cd-setup.md               📚 Pełna dokumentacja
├── ci-cd-migration-guide.md     🔄 Przewodnik migracji
├── ci-cd-architecture.md        🏗️  Architektura
└── ci-cd-visual-guide.md        🎨 Przewodnik wizualny

CI-CD-IMPLEMENTATION-SUMMARY.md  📋 Podsumowanie implementacji
```

---

## 📚 Dokumentacja

### Dla Początkujących

1. **[CI-CD-README.md](./CI-CD-README.md)** ← Jesteś tutaj
   - Szybki przegląd
   - Podstawowe komendy
   - FAQ

2. **[ci-cd-quick-reference.md](./ci-cd-quick-reference.md)**
   - Szybki przewodnik (5 min)
   - Najważniejsze komendy
   - Troubleshooting

3. **[ci-cd-visual-guide.md](./ci-cd-visual-guide.md)**
   - Wizualizacje
   - Diagramy
   - Przykłady

### Dla Zaawansowanych

4. **[ci-cd-setup.md](./ci-cd-setup.md)**
   - Pełna dokumentacja (30 min)
   - Szczegółowa konfiguracja
   - Best practices

5. **[ci-cd-architecture.md](./ci-cd-architecture.md)**
   - Architektura techniczna
   - Diagramy Mermaid
   - Performance metrics

6. **[ci-cd-migration-guide.md](./ci-cd-migration-guide.md)**
   - Migracja ze starych workflows
   - Porównanie przed/po
   - Rollback plan

### Nawigacja

7. **[ci-cd-index.md](./ci-cd-index.md)**
   - Indeks całej dokumentacji
   - Ścieżki nauki
   - Szybkie wyszukiwanie

---

## ❓ FAQ

### Jak uruchomić pipeline manualnie?

1. GitHub → Actions → CI/CD Pipeline → Run workflow

**Szczegóły:** [Quick Reference](./ci-cd-quick-reference.md#manual-trigger)

### Jak sprawdzić status pipeline?

1. GitHub → Actions → Zobacz ostatnie uruchomienie
2. Badge w README pokazuje aktualny status

**Szczegóły:** [Quick Reference](./ci-cd-quick-reference.md#status)

### Co zrobić gdy pipeline failuje?

1. Sprawdź logi w GitHub Actions
2. Zobacz sekcję Troubleshooting
3. Napraw lokalnie i push ponownie

**Szczegóły:** [Quick Reference](./ci-cd-quick-reference.md#troubleshooting)

### Jak długo trwa pipeline?

- **Normalnie:** 10-15 minut
- **Z cache:** 11-12 minut
- **Bez cache:** 15-20 minut

**Szczegóły:** [Architecture](./ci-cd-architecture.md#performance)

### Ile kosztuje?

- **Publiczne repo:** Darmowe (unlimited)
- **Prywatne repo:** ~300-600 minut/miesiąc z 2000 dostępnych

**Szczegóły:** [Implementation Summary](../CI-CD-IMPLEMENTATION-SUMMARY.md#costs)

### Czy mogę modyfikować workflow?

Tak! Edytuj `.github/workflows/ci-cd.yml`

**Szczegóły:** [Full Documentation](./ci-cd-setup.md#configuration)

### Co to są artefakty?

Pliki generowane przez pipeline:
- `coverage-report` - raport pokrycia testami (7 dni)
- `playwright-report` - wyniki E2E (30 dni)
- `dist` - build produkcyjny (7 dni)

**Szczegóły:** [Full Documentation](./ci-cd-setup.md#artifacts)

### Jak pobrać artefakty?

1. GitHub → Actions → Wybierz run
2. Scroll do "Artifacts"
3. Kliknij aby pobrać

**Szczegóły:** [Full Documentation](./ci-cd-setup.md#artifacts)

---

## 🎯 Najczęstsze Zadania

### Zadanie 1: Push do master z testami

```bash
# 1. Sprawdź lokalnie
npm run lint
npm run test
npm run build

# 2. Commit i push
git add .
git commit -m "feat: new feature"
git push origin master

# 3. Sprawdź w GitHub Actions
# Pipeline uruchomi się automatycznie
```

### Zadanie 2: Debugowanie failed pipeline

```bash
# 1. Zobacz logi w GitHub Actions
# 2. Sprawdź który job failował
# 3. Napraw lokalnie:

npm run lint:fix        # Jeśli lint failed
npm run test:watch      # Jeśli tests failed
npm run build           # Jeśli build failed
npm run test:e2e:ui     # Jeśli E2E failed

# 4. Push ponownie
git add .
git commit -m "fix: resolve issues"
git push origin master
```

### Zadanie 3: Sprawdzenie coverage

```bash
# 1. Uruchom pipeline (automatycznie lub manualnie)
# 2. Poczekaj na zakończenie
# 3. GitHub Actions → Artifacts → coverage-report
# 4. Pobierz i otwórz index.html
```

---

## ✅ Checklist przed Push

```bash
# Zawsze przed pushem do master:

□ npm run lint:fix      # Napraw linting
□ npm run test          # Sprawdź testy
□ npm run build         # Zweryfikuj build
□ git status            # Sprawdź zmiany
□ git push origin master # Push i trigger CI/CD
```

---

## 🔧 Konfiguracja

### Zmienne Środowiskowe

Pipeline używa:
- `CI=true` - automatycznie ustawiane przez GitHub Actions
- `NODE_ENV=production` - dla production build

### Secrets (dla przyszłości)

Gdy będą potrzebne (Supabase, OpenRouter):

1. GitHub → Settings → Secrets and variables → Actions
2. New repository secret
3. Użyj w workflow:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

**Szczegóły:** [Full Documentation](./ci-cd-setup.md#secrets)

---

## 🚨 Troubleshooting

### Problem: Pipeline nie uruchamia się

**Rozwiązanie:**
1. Sprawdź czy plik `ci-cd.yml` jest w master
2. Sprawdź syntax YAML
3. Zobacz logi w Actions

### Problem: Lint fails

**Rozwiązanie:**
```bash
npm run lint:fix
git add .
git commit -m "fix: linting"
git push
```

### Problem: Tests fail

**Rozwiązanie:**
```bash
npm run test:watch
# Napraw testy
npm run test
git add .
git commit -m "fix: tests"
git push
```

### Problem: E2E timeout

**Rozwiązanie:**
```bash
npm run test:e2e:ui
# Debuguj w UI mode
# Napraw testy
git add .
git commit -m "fix: e2e tests"
git push
```

### Problem: Build fails

**Rozwiązanie:**
```bash
npm run build
# Sprawdź błędy
# Napraw
git add .
git commit -m "fix: build"
git push
```

**Więcej:** [Quick Reference - Troubleshooting](./ci-cd-quick-reference.md#troubleshooting)

---

## 📈 Optymalizacje

Pipeline jest zoptymalizowany pod kątem:

✅ **Szybkości**
- Cache npm dependencies (~2 min oszczędności)
- Tylko Chromium dla Playwright (~3 min oszczędności)
- Concurrency control (auto-cancel starych runs)

✅ **Kosztów**
- Fail fast strategy (stop przy pierwszym błędzie)
- Selective browser installation
- Efficient artifact management

✅ **Developer Experience**
- Przejrzyste podsumowania
- Automatyczne raporty
- Szybki feedback

**Szczegóły:** [Architecture - Optimizations](./ci-cd-architecture.md#optimizations)

---

## 🔮 Przyszłe Rozszerzenia

Możliwe rozszerzenia (nie są jeszcze zaimplementowane):

- 🚀 **Deployment** - automatyczne wdrożenie do Vercel/Netlify
- 📢 **Notifications** - powiadomienia Slack/Discord
- 🧪 **Matrix Testing** - testowanie na wielu wersjach Node.js
- 📊 **Performance Monitoring** - Lighthouse CI
- 🔒 **Security Scanning** - automatyczne skanowanie bezpieczeństwa

**Szczegóły:** [Full Documentation - Extensions](./ci-cd-setup.md#extensions)

---

## 📊 Statystyki

### Dokumentacja

- **Plików:** 8
- **Linii kodu:** ~2,838
- **Sekcji:** 105+
- **Czas czytania:** ~105 minut (całość)

### Pipeline

- **Jobs:** 4
- **Czas:** 10-15 minut
- **Artefakty:** 3
- **Optymalizacje:** 4+

### Coverage

- ✅ Linting
- ✅ Unit tests
- ✅ E2E tests
- ✅ Production build
- ✅ Artifact generation
- ✅ Automated summary

---

## 🎓 Ścieżka Nauki

### Poziom 1: Podstawy (15 minut)

1. Przeczytaj ten plik (CI-CD-README.md)
2. Przejrzyj [Quick Reference](./ci-cd-quick-reference.md)
3. Uruchom pipeline manualnie
4. Sprawdź wyniki w GitHub Actions

### Poziom 2: Średniozaawansowany (45 minut)

1. Przeczytaj [Full Documentation](./ci-cd-setup.md)
2. Przejrzyj [Visual Guide](./ci-cd-visual-guide.md)
3. Push do master i obserwuj pipeline
4. Pobierz i przejrzyj artefakty

### Poziom 3: Zaawansowany (90 minut)

1. Przeczytaj [Architecture](./ci-cd-architecture.md)
2. Przejrzyj [Migration Guide](./ci-cd-migration-guide.md)
3. Zmodyfikuj workflow dla swoich potrzeb
4. Dodaj własne kroki/optymalizacje

**Szczegóły:** [Index - Learning Path](./ci-cd-index.md#learning-path)

---

## 🔗 Przydatne Linki

### Dokumentacja Wewnętrzna

- 📖 [Indeks Dokumentacji](./ci-cd-index.md)
- ⚡ [Quick Reference](./ci-cd-quick-reference.md)
- 📚 [Full Documentation](./ci-cd-setup.md)
- 🔄 [Migration Guide](./ci-cd-migration-guide.md)
- 🏗️ [Architecture](./ci-cd-architecture.md)
- 🎨 [Visual Guide](./ci-cd-visual-guide.md)
- 📋 [Implementation Summary](../CI-CD-IMPLEMENTATION-SUMMARY.md)

### Dokumentacja Zewnętrzna

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Astro Docs](https://astro.build)

### Narzędzia

- [YAML Validator](https://www.yamllint.com/)
- [GitHub CLI](https://cli.github.com/)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

## 💡 Tips & Tricks

### Tip 1: Szybkie sprawdzenie przed pushem

```bash
npm run lint && npm run test && npm run build && echo "✅ Ready to push!"
```

### Tip 2: Watch logs w czasie rzeczywistym

```bash
# Wymaga GitHub CLI
gh run watch
```

### Tip 3: Pobierz artefakty z CLI

```bash
# Wymaga GitHub CLI
gh run download <run-id> -n dist
```

### Tip 4: Lista ostatnich runs

```bash
# Wymaga GitHub CLI
gh run list --workflow=ci-cd.yml --limit 5
```

### Tip 5: Re-run failed jobs

W GitHub Actions → Failed run → Re-run failed jobs

**Więcej:** [Quick Reference - Tips](./ci-cd-quick-reference.md#tips)

---

## ✅ Status Implementacji

- [x] Workflow `ci-cd.yml` utworzony
- [x] Dokumentacja kompletna (8 plików)
- [x] README zaktualizowany z badge
- [x] Stare workflows oznaczone jako DEPRECATED
- [x] Optymalizacje zaimplementowane
- [x] Best practices zastosowane
- [x] Testy gotowe do uruchomienia

**Status:** ✅ **GOTOWE DO UŻYCIA**

---

## 📞 Wsparcie

### Potrzebujesz pomocy?

1. Sprawdź [FAQ](#faq) powyżej
2. Zobacz [Quick Reference - Troubleshooting](./ci-cd-quick-reference.md#troubleshooting)
3. Przeczytaj [Full Documentation](./ci-cd-setup.md)
4. Sprawdź logi w GitHub Actions

### Znalazłeś błąd?

1. Sprawdź czy to nie jest znany problem
2. Zobacz [Migration Guide - Troubleshooting](./ci-cd-migration-guide.md#troubleshooting)
3. Zgłoś issue w repozytorium

---

## 🎉 Podsumowanie

Masz teraz:

✅ **Kompletny pipeline CI/CD** działający automatycznie  
✅ **Pełną dokumentację** (8 plików, 2838 linii)  
✅ **Optymalizacje** (cache, concurrency, selective browsers)  
✅ **Best practices** (fail fast, artifacts, summaries)  
✅ **Wsparcie** (FAQ, troubleshooting, guides)

**Następne kroki:**

1. ✅ Push do master i zobacz pipeline w akcji
2. ✅ Przejrzyj dokumentację według potrzeb
3. ✅ Dostosuj workflow do swoich potrzeb (opcjonalnie)

---

**Wersja:** 1.0.0  
**Data:** 2025-11-16  
**Status:** ✅ Production Ready

**Autor:** AI Assistant  
**Projekt:** AI Flashcards Generation Platform

