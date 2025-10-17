-- ============================================================================
-- Migration: Create Initial Schema
-- Created: 2025-10-17 14:00:00 UTC
-- Purpose: Initialize the database schema for the flashcard learning platform
-- 
-- Affected Tables:
--   - auth.users (reference only, managed by Supabase Auth)
--   - public.decks
--   - public.flashcards
--   - public.generations
--
-- Special Considerations:
--   - All tables use UUID primary keys for scalability
--   - Row Level Security (RLS) is enabled on all tables
--   - Granular RLS policies for both 'anon' and 'authenticated' roles
--   - Indexes created for foreign keys to optimize query performance
--   - JSONB used for flexible metadata storage
--   - Timestamps with timezone for proper temporal tracking
-- ============================================================================

-- ============================================================================
-- TABLE: decks
-- Purpose: Stores flashcard decks created by users
-- Owner: Each deck belongs to a single user (user_id)
-- ============================================================================

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  metadata jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security for decks table
-- This ensures users can only access their own decks
alter table public.decks enable row level security;

-- RLS Policy: Allow authenticated users to view their own decks
-- Rationale: Users should only see decks they own
create policy "Users can view their own decks"
  on public.decks
  for select
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to insert their own decks
-- Rationale: Authenticated users can create new decks for themselves
create policy "Users can insert their own decks"
  on public.decks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to update their own decks
-- Rationale: Users should only modify decks they own
create policy "Users can update their own decks"
  on public.decks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to delete their own decks
-- Rationale: Users should only delete decks they own
-- Note: This will cascade delete all flashcards in the deck
create policy "Users can delete their own decks"
  on public.decks
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policy: Anonymous users cannot view any decks
-- Rationale: Decks are private to authenticated users only
create policy "Anonymous users cannot view decks"
  on public.decks
  for select
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot insert decks
-- Rationale: Only authenticated users can create decks
create policy "Anonymous users cannot insert decks"
  on public.decks
  for insert
  to anon
  with check (false);

-- RLS Policy: Anonymous users cannot update decks
-- Rationale: Only authenticated users can modify decks
create policy "Anonymous users cannot update decks"
  on public.decks
  for update
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot delete decks
-- Rationale: Only authenticated users can delete decks
create policy "Anonymous users cannot delete decks"
  on public.decks
  for delete
  to anon
  using (false);

-- Create index on user_id for optimized queries
-- Rationale: Frequent queries will filter decks by user_id
create index idx_decks_user_id on public.decks(user_id);

-- ============================================================================
-- TABLE: flashcards
-- Purpose: Stores individual flashcards within decks
-- Types: 'question-answer' or 'gaps'
-- Source: 'ai-full' (fully AI generated), 'ai-edited' (AI + user edits), 'manual'
-- ============================================================================

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  type varchar(50) not null check (type in ('question-answer', 'gaps')),
  source varchar(50) not null check (source in ('ai-full', 'ai-edited', 'manual')),
  front varchar(200) not null,
  back varchar(500) not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security for flashcards table
-- This ensures users can only access flashcards in their own decks
alter table public.flashcards enable row level security;

-- RLS Policy: Allow authenticated users to view flashcards in their own decks
-- Rationale: Users can only see flashcards in decks they own
create policy "Users can view flashcards in their own decks"
  on public.flashcards
  for select
  to authenticated
  using (
    exists (
      select 1 from public.decks
      where decks.id = flashcards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- RLS Policy: Allow authenticated users to insert flashcards into their own decks
-- Rationale: Users can create flashcards in decks they own
create policy "Users can insert flashcards into their own decks"
  on public.flashcards
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.decks
      where decks.id = flashcards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- RLS Policy: Allow authenticated users to update flashcards in their own decks
-- Rationale: Users can modify flashcards in decks they own
create policy "Users can update flashcards in their own decks"
  on public.flashcards
  for update
  to authenticated
  using (
    exists (
      select 1 from public.decks
      where decks.id = flashcards.deck_id
      and decks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.decks
      where decks.id = flashcards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- RLS Policy: Allow authenticated users to delete flashcards from their own decks
-- Rationale: Users can remove flashcards from decks they own
create policy "Users can delete flashcards from their own decks"
  on public.flashcards
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.decks
      where decks.id = flashcards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- RLS Policy: Anonymous users cannot view any flashcards
-- Rationale: Flashcards are private to authenticated users only
create policy "Anonymous users cannot view flashcards"
  on public.flashcards
  for select
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot insert flashcards
-- Rationale: Only authenticated users can create flashcards
create policy "Anonymous users cannot insert flashcards"
  on public.flashcards
  for insert
  to anon
  with check (false);

-- RLS Policy: Anonymous users cannot update flashcards
-- Rationale: Only authenticated users can modify flashcards
create policy "Anonymous users cannot update flashcards"
  on public.flashcards
  for update
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot delete flashcards
-- Rationale: Only authenticated users can delete flashcards
create policy "Anonymous users cannot delete flashcards"
  on public.flashcards
  for delete
  to anon
  using (false);

-- Create index on deck_id for optimized queries
-- Rationale: Frequent queries will filter flashcards by deck_id
create index idx_flashcards_deck_id on public.flashcards(deck_id);

-- ============================================================================
-- TABLE: generations
-- Purpose: Tracks AI generation requests for analytics and usage monitoring
-- Stores: model used, count of generated flashcards, and generation duration
-- ============================================================================

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar(100) not null,
  flashcards_count integer not null,
  generation_duration interval not null,
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security for generations table
-- This ensures users can only access their own generation records
alter table public.generations enable row level security;

-- RLS Policy: Allow authenticated users to view their own generation records
-- Rationale: Users should only see their own AI usage history
create policy "Users can view their own generations"
  on public.generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to insert their own generation records
-- Rationale: Authenticated users can create generation records for themselves
create policy "Users can insert their own generations"
  on public.generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to update their own generation records
-- Rationale: Users can modify their own generation records if needed
create policy "Users can update their own generations"
  on public.generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to delete their own generation records
-- Rationale: Users can remove their own generation records if needed
create policy "Users can delete their own generations"
  on public.generations
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policy: Anonymous users cannot view any generation records
-- Rationale: Generation records are private to authenticated users only
create policy "Anonymous users cannot view generations"
  on public.generations
  for select
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot insert generation records
-- Rationale: Only authenticated users can create generation records
create policy "Anonymous users cannot insert generations"
  on public.generations
  for insert
  to anon
  with check (false);

-- RLS Policy: Anonymous users cannot update generation records
-- Rationale: Only authenticated users can modify generation records
create policy "Anonymous users cannot update generations"
  on public.generations
  for update
  to anon
  using (false);

-- RLS Policy: Anonymous users cannot delete generation records
-- Rationale: Only authenticated users can delete generation records
create policy "Anonymous users cannot delete generations"
  on public.generations
  for delete
  to anon
  using (false);

-- Create index on user_id for optimized queries
-- Rationale: Frequent queries will filter generations by user_id
create index idx_generations_user_id on public.generations(user_id);

-- ============================================================================
-- FUNCTIONS: Automatic timestamp updates
-- Purpose: Automatically update updated_at column on record modification
-- ============================================================================

-- Function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for decks table
-- Rationale: Automatically track when deck records are modified
create trigger set_updated_at_decks
  before update on public.decks
  for each row
  execute function public.handle_updated_at();

-- Trigger for flashcards table
-- Rationale: Automatically track when flashcard records are modified
create trigger set_updated_at_flashcards
  before update on public.flashcards
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- End of migration
-- ============================================================================

