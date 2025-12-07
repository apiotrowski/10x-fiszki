// Import bazowych typów z definicji bazy danych
import type { Database } from "./db/database.types";

// Alias dla rekordów z poszczególnych tabel
type DeckRow = Database["public"]["Tables"]["decks"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];
type LearningSessionRow = Database["public"]["Tables"]["learning_sessions"]["Row"];

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

// DTO reprezentujący listę decków z paginacją
export interface DeckListDTO {
  decks: DeckDTO[];
  pagination: PaginationDTO;
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

/*
 * Pagination and Filtering
 */

// DTO reprezentujący parametry paginacji z filtrowaniem
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  sort?: string;
  filter?: string;
  order?: Order;
}

export type Source = "manual" | "ai-full" | "ai-edited";
export type Type = "question-answer" | "gaps";
export type Model = "gpt-4o-mini" | "gpt-4o";
export type Order = "asc" | "desc";

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

// DTO reprezentujący listę flashcards z paginacją
export interface FlashcardListDTO {
  flashcards: FlashcardDTO[];
  pagination: PaginationDTO;
}

// DTO reprezentujący pojedynczą flashcard do utworzenia (bez source, który jest ustawiany automatycznie)
export interface FlashcardProposalDTO {
  type: Type;
  front: string;
  back: string;
  source: Source;
  generation_id: string | null;
  deck_id: string;
  is_accepted: boolean;
}

// Komenda utworzenia flashcard (żądanie ręczne)
export interface CreateFlashcardsCommand {
  flashcards: FlashcardProposalDTO[];
}

// Komenda aktualizacji flashcard (pola opcjonalne)
export interface UpdateFlashcardCommand {
  type?: Type;
  front?: FlashcardRow["front"];
  back?: FlashcardRow["back"];
  source?: Source;
  generation_id?: number | null;
  deck_id?: string;
}

/*
 * AI-Driven Flashcard Generation
 */

// Komenda do generacji flashcards przy użyciu AI
export interface GenerateFlashcardsCommand {
  text: string;
}

// DTO reprezentujący wynik generacji flashcards
export interface GenerateFlashcardsResponseDTO {
  generation_id: GenerationRow["id"];
  generation_count: number;
  flashcard_proposals: FlashcardProposalDTO[];
  created_at: GenerationRow["created_at"];
}

/*
 * Study Sessions Management
 */

// Komenda utworzenia sesji nauki
export interface CreateStudySessionCommand {
  deck_id: string;
}

// DTO reprezentujący sesję nauki z metadanymi
export interface StudySessionDTO {
  session_id: LearningSessionRow["id"];
  deck_id: LearningSessionRow["deck_id"];
  user_id: LearningSessionRow["user_id"];
  total_cards: number;
  cards_reviewed: number;
  created_at: LearningSessionRow["started_at"];
}
