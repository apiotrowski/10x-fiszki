-- ============================================================================
-- Migration: Add Sorting Indexes to Flashcards Table
-- Created: 2025-10-21 13:00:00 UTC
-- Purpose: Optimize sorting performance for listing flashcards
--
-- Rationale:
--   The GET /api/decks/{deckId}/flashcards endpoint supports sorting by
--   created_at and updated_at columns. Creating composite indexes that include
--   deck_id along with these timestamp columns will significantly improve
--   query performance for paginated and sorted results.
--
-- Performance Impact:
--   - Faster ORDER BY queries when listing flashcards
--   - Improved pagination performance for large decks
--   - Better support for concurrent queries from multiple users
-- ============================================================================

-- Create composite index on (deck_id, created_at)
-- This optimizes the most common sorting scenario (sort by creation date)
create index idx_flashcards_deck_id_created_at 
  on public.flashcards(deck_id, created_at desc);

-- Create composite index on (deck_id, updated_at)
-- This optimizes sorting by last modification date
create index idx_flashcards_deck_id_updated_at 
  on public.flashcards(deck_id, updated_at desc);

-- Create composite index on (deck_id, type)
-- This optimizes filtering by flashcard type (question-answer, gaps)
create index idx_flashcards_deck_id_type 
  on public.flashcards(deck_id, type);

-- Create composite index on (deck_id, source)
-- This optimizes filtering by flashcard source (manual, ai-full, ai-edited)
create index idx_flashcards_deck_id_source 
  on public.flashcards(deck_id, source);

-- ============================================================================
-- Performance Notes:
--
-- 1. The DESC order in timestamp indexes matches the query pattern
--    (newest first), which is the most common use case for users.
--
-- 2. Composite indexes (deck_id + filter_column) allow PostgreSQL to
--    efficiently filter by deck AND apply the filter in a single index scan.
--
-- 3. These indexes support both:
--    - Filtered queries: WHERE deck_id = X AND type = Y
--    - Sorted queries: WHERE deck_id = X ORDER BY created_at DESC
--    - Combined: WHERE deck_id = X AND type = Y ORDER BY created_at DESC
--
-- 4. The indexes are relatively small since flashcards table is expected
--    to have moderate row counts per deck (typically < 1000 cards per deck).
-- ============================================================================

