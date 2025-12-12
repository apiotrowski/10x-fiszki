# E2E Tests CI/CD Setup

## Overview

This document explains how E2E tests are configured to run both locally and in GitHub Actions CI/CD pipeline.

## Problem

The E2E tests were failing in GitHub Actions with the error:
```
[dotenv@17.2.3] injecting env (0) from .env.test
Error getting next flashcard: Error: Sesja została zakończona
```

This occurred because:
1. Locally, tests use `.env.test` file to load environment variables
2. In CI, the `.env.test` file doesn't exist (and shouldn't be committed)
3. GitHub Actions provides environment variables via secrets, but Astro's `--mode test` flag specifically looks for `.env.test` file

## Solution

The solution involves two key changes:

### 1. Conditional Playwright Configuration

**File**: `playwright.config.ts`

The Playwright config now:
- Loads `.env.test` only when NOT in CI (lines 5-8)
- Uses different dev server commands for CI vs local (line 84):
  - **CI**: `astro dev --port 54320` (uses env vars from GitHub secrets)
  - **Local**: `npm run dev:e2e` (uses `--mode test` to load `.env.test`)

```typescript
// Only load .env.test if not in CI
if (!process.env.CI) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
}

// ...

webServer: {
  command: process.env.CI ? "astro dev --port 54320" : "npm run dev:e2e",
  url: "http://localhost:54320",
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

### 2. Updated .gitignore

**File**: `.gitignore`

Added `.env.test` to gitignore to prevent accidental commits:
```
.env
.env.production
.env.local
.env.test
```

## Local Setup

### 1. Create .env.test file

Create a `.env.test` file in the project root with your test environment variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-key-here

# OpenAI API Key (optional)
OPENAI_API_KEY=your-openai-key-here
```

### 2. Run E2E tests

```bash
npm run test:e2e
```

The tests will:
1. Load environment variables from `.env.test`
2. Start Astro dev server on port 54320 in test mode
3. Run Playwright tests against the dev server

## CI/CD Setup

### GitHub Actions Configuration

**File**: `.github/workflows/ci-cd.yml`

The E2E tests job is configured with:

```yaml
e2e-tests:
  name: E2E Tests (Playwright)
  runs-on: ubuntu-latest
  environment: integration
  needs: [lint, unit-tests]
  timeout-minutes: 60

  steps:
    # ... setup steps ...

    - name: Run Playwright tests
      run: npm run test:e2e
      env:
        CI: true
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
        E2E_USERNAME_ID: ${{ secrets.E2E_USERNAME_ID }}
        E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
        E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

### Required GitHub Secrets

Configure these secrets in your GitHub repository:
- Settings → Secrets and variables → Actions → Repository secrets

**Required secrets:**
1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_KEY` - Your Supabase anon/public key
3. `OPENROUTER_API_KEY` - OpenRouter API key for AI features
4. `E2E_USERNAME_ID` - Test user ID in Supabase
5. `E2E_USERNAME` - Test user email
6. `E2E_PASSWORD` - Test user password

**Optional secrets:**
- `OPENAI_API_KEY` - OpenAI API key (if using OpenAI directly)

## How It Works

### Local Development Flow

1. Developer creates `.env.test` with test credentials
2. Runs `npm run test:e2e`
3. Playwright config detects `!process.env.CI` → loads `.env.test`
4. Starts dev server with `npm run dev:e2e` (uses `--mode test`)
5. Astro loads `.env.test` automatically in test mode
6. Tests run with environment variables from `.env.test`

### CI/CD Flow

1. GitHub Actions workflow starts
2. Sets `CI=true` environment variable
3. Provides secrets as environment variables
4. Runs `npm run test:e2e`
5. Playwright config detects `process.env.CI` → skips loading `.env.test`
6. Starts dev server with `astro dev --port 54320` (no `--mode test`)
7. Astro uses environment variables from GitHub Actions
8. Tests run with environment variables from GitHub secrets

## Troubleshooting

### Tests fail locally with "env (0) from .env.test"

**Problem**: `.env.test` file doesn't exist or is empty

**Solution**: Create `.env.test` file with required environment variables (see Local Setup section)

### Tests fail in CI with authentication errors

**Problem**: GitHub secrets not configured correctly

**Solution**: 
1. Verify all required secrets are set in GitHub repository settings
2. Check secret names match exactly (case-sensitive)
3. Ensure Supabase credentials are valid for your test environment

### Tests fail in CI with "Sesja została zakończona"

**Problem**: Test user doesn't exist in the test database or session expired

**Solution**:
1. Verify test user exists in your Supabase test environment
2. Check `E2E_USERNAME` and `E2E_PASSWORD` secrets match the test user
3. Ensure test user has necessary permissions and data (decks, flashcards)

## Best Practices

1. **Never commit `.env.test`** - It contains sensitive credentials
2. **Use separate Supabase project for testing** - Don't test against production
3. **Keep test data minimal** - Only create necessary test fixtures
4. **Document test user setup** - Make it easy for team members to set up local testing
5. **Rotate secrets regularly** - Update GitHub secrets and `.env.test` periodically

## Related Files

- `playwright.config.ts` - Playwright configuration with conditional env loading
- `.github/workflows/ci-cd.yml` - GitHub Actions workflow with E2E tests
- `.gitignore` - Excludes `.env.test` from version control
- `e2e/fixtures/test-users.ts` - Test user fixtures
- `package.json` - Contains `dev:e2e` script definition

## References

- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

