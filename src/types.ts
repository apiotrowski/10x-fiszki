// Import bazowych typów z definicji bazy danych
import type { Database } from "./db/database.types";

// Alias dla rekordów z poszczególnych tabel
type DeckRow = Database["public"]["Tables"]["decks"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];

/*
 * ==========================
 * DTO i Command Modele
 * ==========================
 */

/*
 * User Authentication & Management
 */

// Komenda rejestracji użytkownika
export interface RegisterUserCommand {
  email: string;
  password: string;
}

// Odpowiedź rejestracji użytkownika
export interface RegisterUserResponse {
  id: string;
  email: string;
  created_at: string;
}

// Komenda logowania użytkownika
export interface LoginUserCommand {
  email: string;
  password: string;
}

// Odpowiedź logowania użytkownika
export interface LoginUserResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

/*
 * Decks Management
 */

// DTO reprezentujący deck (oparty na rekordzie z bazy)
export interface DeckDTO {
  id: DeckRow["id"];
  title: DeckRow["title"];
  metadata: DeckRow["metadata"];
  created_at: DeckRow["created_at"];
  updated_at: DeckRow["updated_at"];
  user_id: DeckRow["user_id"];
}

// Komenda utworzenia decka (pola wymagane w zapytaniu)
export interface CreateDeckCommand {
  title: DeckRow["title"];
  metadata: DeckRow["metadata"];
}

// Komenda aktualizacji decka (pola opcjonalne)
export interface UpdateDeckCommand {
  title?: DeckRow["title"];
  metadata?: DeckRow["metadata"];
}

export type Source = "manual" | "ai-full" | "ai-edited";
export type Type = "question-answer" | "gaps";
export type Model = "gpt-4o-mini" | "gpt-4o";

/*
 * Flashcards Management
 */

// DTO reprezentujący flashcard (oparty na rekordzie z bazy)
export interface FlashcardDTO {
  id: FlashcardRow["id"];
  deck_id: FlashcardRow["deck_id"];
  type: Type;
  front: FlashcardRow["front"];
  back: FlashcardRow["back"];
  source: Source;
  created_at: FlashcardRow["created_at"];
  updated_at: FlashcardRow["updated_at"];
}

// Komenda utworzenia flashcard (żądanie ręczne)
export interface CreateFlashcardCommand {
  type: FlashcardRow["type"];
  front: FlashcardRow["front"];
  back: FlashcardRow["back"];
  source: FlashcardRow["source"];
}

// Komenda aktualizacji flashcard (pola opcjonalne)
export interface UpdateFlashcardCommand {
  type?: FlashcardRow["type"];
  front?: FlashcardRow["front"];
  back?: FlashcardRow["back"];
  source?: FlashcardRow["source"];
}

/*
 * AI-Driven Flashcard Generation
 */

// Komenda do generacji flashcards przy użyciu AI
export interface GenerateFlashcardsCommand {
  text: string;
}

// DTO reprezentujący wynik generacji flashcards
export interface GenerationDTO {
  generation_id: GenerationRow["id"]; // alias dla pola id z tabeli generations
  user_id: GenerationRow["user_id"];
  flashcards: FlashcardDTO[]; // lista wygenerowanych flashcards
  created_at: GenerationRow["created_at"];
  flashcards_count: GenerationRow["flashcards_count"];
  generation_duration: GenerationRow["generation_duration"];
  model: Model;
}
