-- alter_generations_table migration
alter table generations add column source_text_length integer not null;
alter table generations add column source_text_hash varchar(255) not null;
alter table generations add column generation_count integer not null;

-- remove obsolete column from generations table
alter table generations drop column flashcards_count;
