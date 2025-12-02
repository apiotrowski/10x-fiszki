-- ============================================================================
-- Migration: Create Learning Sessions Schema
-- Created: 2025-12-02 14:00:00 UTC
-- Purpose: Create tables for tracking learning sessions and user responses
-- 
-- Affected Tables:
--   - public.learning_sessions
--   - public.learning_session_responses
--
-- Dependencies:
--   - auth.users (managed by Supabase Auth)
--   - public.decks (created in 20251017140000_create_initial_schema.sql)
--   - public.flashcards (created in 20251017140000_create_initial_schema.sql)
--
-- Special Considerations:
--   - All tables use UUID primary keys for scalability
--   - Indexes created for foreign keys to optimize query performance
--   - Timestamps with timezone for proper temporal tracking
--   - Cascade deletes ensure data integrity when parent records are removed
--   - Rating constraint ensures only valid SM-2 algorithm ratings are stored
--   - RLS is NOT enabled - access control handled at application level
-- ============================================================================

-- ============================================================================
-- TABLE: learning_sessions
-- Purpose: Tracks individual learning sessions for spaced repetition
-- Owner: Each session belongs to a single user and is associated with one deck
-- Lifecycle: started_at is set when session begins, ended_at when user finishes
-- ============================================================================

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  started_at timestamp with time zone not null default now(),
  ended_at timestamp with time zone null
);

-- Create index on user_id for optimized queries
-- Rationale: Frequent queries will filter sessions by user_id
-- Use case: "Show me all my learning sessions"
create index idx_learning_sessions_user_id on public.learning_sessions(user_id);

-- Create index on deck_id for optimized queries
-- Rationale: Frequent queries will filter sessions by deck_id
-- Use case: "Show me all sessions for this specific deck"
create index idx_learning_sessions_deck_id on public.learning_sessions(deck_id);

-- Create composite index on user_id and started_at for optimized queries
-- Rationale: Common query pattern to get recent sessions for a user
-- Use case: "Show me my most recent learning sessions"
create index idx_learning_sessions_user_started on public.learning_sessions(user_id, started_at desc);

-- ============================================================================
-- TABLE: learning_session_responses
-- Purpose: Records individual flashcard responses during learning sessions
-- Rating System: Uses SM-2 algorithm ratings (again, hard, good, easy)
-- Timestamps: presented_at tracks when card was shown, answered_at when user responded
-- ============================================================================

create table public.learning_session_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  presented_at timestamp with time zone not null default now(),
  answered_at timestamp with time zone not null default now(),
  rating varchar(10) not null check (rating in ('again', 'hard', 'good', 'easy')),
  next_review_at timestamp with time zone null
);

-- Create index on session_id for optimized queries
-- Rationale: Frequent queries will filter responses by session_id
-- Use case: "Show me all responses for this learning session"
create index idx_learning_session_responses_session_id on public.learning_session_responses(session_id);

-- Create index on flashcard_id for optimized queries
-- Rationale: Frequent queries will filter responses by flashcard_id
-- Use case: "Show me the learning history for this specific flashcard"
create index idx_learning_session_responses_flashcard_id on public.learning_session_responses(flashcard_id);

-- Create index on next_review_at for optimized queries
-- Rationale: Critical for spaced repetition algorithm to find due cards
-- Use case: "Show me all flashcards that are due for review now"
create index idx_learning_session_responses_next_review on public.learning_session_responses(next_review_at)
  where next_review_at is not null;

-- Create composite index on flashcard_id and answered_at for optimized queries
-- Rationale: Common query pattern to get recent responses for a specific flashcard
-- Use case: "Show me the most recent response for this flashcard"
create index idx_learning_session_responses_flashcard_answered on public.learning_session_responses(flashcard_id, answered_at desc);

-- ============================================================================
-- End of migration
-- ============================================================================

