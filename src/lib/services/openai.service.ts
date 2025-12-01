import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import {
  aiGenerationResponseSchema,
  openAIGenerateInputSchema,
  type AIFlashcard,
} from "../validations/generation.validation";

/**
 * JSON Schema for OpenAI structured output
 * Defines the expected format for AI-generated flashcards
 */
const OPENAI_RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "AIGenerationResponse",
    strict: true,
    schema: {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["question-answer", "gaps"],
                description: "Type of flashcard: question-answer or gaps (fill in the blanks)",
              },
              front: {
                type: "string",
                description: "Front side of the flashcard (question or text with gaps)",
                maxLength: 200,
              },
              back: {
                type: "string",
                description: "Back side of the flashcard (answer or gap fillers)",
                maxLength: 500,
              },
            },
            required: ["type", "front", "back"],
            additionalProperties: false,
          },
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ["flashcards"],
      additionalProperties: false,
    },
  },
} as const;

/**
 * Configuration interface for OpenAI service
 */
interface OpenAIServiceConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default configuration for OpenAI API calls
 */
const DEFAULT_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4000,
} as const;

/**
 * OpenAI Service for generating flashcards using GPT-4o-mini
 *
 * This service handles all interactions with the OpenAI API for flashcard generation.
 * It implements structured output using JSON schema to ensure consistent response format.
 *
 * Features:
 * - Validates input text length (1000-10000 characters)
 * - Generates appropriate number of flashcards based on text length
 * - Supports both question-answer and gaps type flashcards
 * - Implements retry logic for transient failures
 * - Comprehensive error handling and logging
 *
 * @example
 * ```typescript
 * const service = new OpenAIService({ apiKey: process.env.OPENAI_API_KEY });
 * const flashcards = await service.generateFlashcardsWithAI(text, 15);
 * ```
 */
export class OpenAIService {
  private readonly _client: OpenAI;
  private readonly _model: string;
  private readonly _temperature: number;
  private readonly _maxTokens: number;

  /**
   * Creates a new OpenAI service instance
   *
   * @param config - Configuration object containing API key and optional parameters
   * @throws {Error} If API key is missing or invalid
   */
  constructor(config: OpenAIServiceConfig) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error("Klucz API OpenAI jest wymagany");
    }

    this._client = new OpenAI({
      apiKey: config.apiKey,
    });

    this._model = config.model ?? DEFAULT_CONFIG.model;
    this._temperature = config.temperature ?? DEFAULT_CONFIG.temperature;
    this._maxTokens = config.maxTokens ?? DEFAULT_CONFIG.maxTokens;
  }

  /**
   * Generates flashcards from input text using OpenAI API
   *
   * @param text - Input text to generate flashcards from (1000-10000 characters)
   * @param numberOfFlashcards - Desired number of flashcards to generate
   * @returns Promise resolving to array of AI-generated flashcards
   * @throws {Error} If input validation fails, API call fails, or response is invalid
   */
  async generateFlashcardsWithAI(text: string, numberOfFlashcards: number): Promise<AIFlashcard[]> {
    // Validate input using Zod schema
    const validationResult = openAIGenerateInputSchema.safeParse({ text, numberOfFlashcards });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];

      // Handle text validation errors with enhanced messages
      if (firstError.path[0] === "text") {
        // Check if text is not a string or is null/undefined
        if (firstError.code === "invalid_type") {
          throw new Error("Tekst wejściowy jest wymagany i musi być ciągiem znaków");
        }
        // Check if text is too short (including empty string)
        if (firstError.code === "too_small" && typeof text === "string") {
          if (text.length === 0) {
            throw new Error("Tekst wejściowy jest wymagany i musi być ciągiem znaków");
          }
          throw new Error(`Tekst jest za krótki (${text.length} znaków). Wymagane minimum 1000 znaków.`);
        }
        // Check if text is too long
        if (firstError.code === "too_big" && typeof text === "string") {
          throw new Error(`Tekst jest za długi (${text.length} znaków). Maksymalnie 10000 znaków.`);
        }
      }

      throw new Error(firstError.message);
    }

    // Build messages for API call
    const messages = this._buildMessages(text, numberOfFlashcards);

    try {
      // Call OpenAI API with retry logic
      const response = await this._callOpenAIWithRetry(messages);

      // Parse and validate response
      const flashcards = this._handleApiResponse(response);

      console.info(`Pomyślnie wygenerowano ${flashcards.length} fiszek`);
      return flashcards;
    } catch (error) {
      console.error("Błąd podczas generowania fiszek za pomocą OpenAI:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Builds system message for OpenAI API
   * Instructs the AI on how to generate flashcards
   *
   * @returns System message string
   */
  private _buildSystemMessage(): string {
    return `Jesteś ekspertem w tworzeniu materiałów edukacyjnych, specjalizującym się w generowaniu fiszek.

Twoim zadaniem jest stworzenie wysokiej jakości fiszek na podstawie dostarczonego tekstu. Postępuj zgodnie z poniższymi wytycznymi:

1. **Typy fiszek:**
   - "question-answer": Tradycyjny format pytanie-odpowiedź
   - "gaps": Format z lukami do uzupełnienia, oznaczonymi jako [luka1], [luka2], itd.

2. **Standardy jakości:**
   - Skup się na kluczowych pojęciach, definicjach i ważnych faktach
   - Formułuj pytania jasno i jednoznacznie
   - Upewnij się, że odpowiedzi są zwięzłe, ale kompletne
   - Dla typu "gaps": użyj formatu "Tekst z [luka1] i [luka2]" na przodzie, oraz "[odpowiedź1]; [odpowiedź2]" na odwrocie

3. **Dystrybucja treści:**
   - Odpowiednio mieszaj oba typy fiszek
   - Obejmuj różne aspekty tekstu
   - Priorytetyzuj najważniejsze informacje

4. **Ograniczenia:**
   - Przód fiszki: maksymalnie 200 znaków
   - Tył fiszki: maksymalnie 500 znaków
   - Wygeneruj dokładnie żądaną liczbę fiszek

Musisz odpowiedzieć w formacie JSON zgodnym z dostarczonym schematem.`;
  }

  /**
   * Builds user message from input text
   *
   * @param text - Input text to process
   * @param numberOfFlashcards - Desired number of flashcards
   * @returns User message string
   */
  private _buildUserMessage(text: string, numberOfFlashcards: number): string {
    return `Wygeneruj dokładnie ${numberOfFlashcards} fiszek na podstawie poniższego tekstu. Stwórz mieszankę fiszek typu "question-answer" i "gaps".

Tekst:
${text}

Pamiętaj, aby:
- Wygenerować dokładnie ${numberOfFlashcards} fiszek
- Mieszać oba typy: question-answer i gaps
- Zachować przód fiszki poniżej 200 znaków
- Zachować tył fiszki poniżej 500 znaków
- Skupić się na najważniejszych koncepcjach`;
  }

  /**
   * Builds complete messages array for OpenAI API
   *
   * @param text - Input text
   * @param numberOfFlashcards - Number of flashcards to generate
   * @returns Array of chat messages
   */
  private _buildMessages(text: string, numberOfFlashcards: number): ChatCompletionCreateParamsNonStreaming["messages"] {
    return [
      {
        role: "system",
        content: this._buildSystemMessage(),
      },
      {
        role: "user",
        content: this._buildUserMessage(text, numberOfFlashcards),
      },
    ];
  }

  /**
   * Calls OpenAI API with the configured parameters
   *
   * @param messages - Chat messages to send
   * @returns OpenAI API response
   */
  private async _callOpenAI(
    messages: ChatCompletionCreateParamsNonStreaming["messages"]
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const response = await this._client.chat.completions.create({
      model: this._model,
      messages,
      temperature: this._temperature,
      max_tokens: this._maxTokens,
      response_format: OPENAI_RESPONSE_SCHEMA,
    });

    return response;
  }

  /**
   * Calls OpenAI API with exponential backoff retry logic
   * Retries on transient errors (rate limits, network issues)
   *
   * @param messages - Chat messages to send
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns OpenAI API response
   * @throws {Error} If all retry attempts fail
   */
  private async _callOpenAIWithRetry(
    messages: ChatCompletionCreateParamsNonStreaming["messages"],
    maxRetries = 3
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this._callOpenAI(messages);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const isRetryable = this._isRetryableError(error);

        if (!isRetryable || attempt === maxRetries) {
          throw lastError;
        }

        // Calculate exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(
          `Wywołanie API OpenAI nie powiodło się (próba ${attempt + 1}/${maxRetries + 1}). Ponowna próba za ${delay}ms...`
        );

        await this._sleep(delay);
      }
    }

    throw lastError || new Error("Wywołanie API OpenAI nie powiodło się po wszystkich próbach");
  }

  /**
   * Determines if an error is retryable
   *
   * @param error - Error to check
   * @returns True if error is retryable
   */
  private _isRetryableError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      // Retry on rate limits and server errors
      return error.status === 429 || (error.status !== undefined && error.status >= 500);
    }

    // Retry on network errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes("network") || message.includes("timeout") || message.includes("econnreset");
    }

    return false;
  }

  /**
   * Handles and parses OpenAI API response
   * Validates response structure and content
   *
   * @param response - OpenAI API response
   * @returns Array of validated flashcards
   * @throws {Error} If response is invalid or validation fails
   */
  private _handleApiResponse(response: OpenAI.Chat.Completions.ChatCompletion): AIFlashcard[] {
    // Check if response has choices
    if (!response.choices || response.choices.length === 0) {
      throw new Error("API OpenAI zwróciło pustą odpowiedź");
    }

    const choice = response.choices[0];

    // Check if choice has message
    if (!choice.message || !choice.message.content) {
      throw new Error("Odpowiedź API OpenAI nie zawiera treści wiadomości");
    }

    // Parse JSON response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(choice.message.content);
    } catch {
      throw new Error("API OpenAI zwróciło nieprawidłowy JSON");
    }

    // Validate response against schema
    const validationResult = aiGenerationResponseSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      throw new Error(`Walidacja odpowiedzi API OpenAI nie powiodła się: ${validationResult.error.message}`);
    }

    return validationResult.data.flashcards;
  }

  /**
   * Handles errors and converts them to user-friendly messages
   *
   * @param error - Error to handle
   * @returns Formatted error
   */
  private _handleError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          return new Error("Uwierzytelnianie API OpenAI nie powiodło się. Sprawdź swój klucz API.");
        case 429:
          return new Error("Przekroczono limit zapytań API OpenAI. Spróbuj ponownie później.");
        case 500:
        case 502:
        case 503:
          return new Error("Usługa API OpenAI jest tymczasowo niedostępna. Spróbuj ponownie później.");
        default:
          return new Error(`Błąd API OpenAI: ${error.message}`);
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("Wystąpił nieoczekiwany błąd podczas generowania fiszek");
  }

  /**
   * Sleep utility for retry delays
   *
   * @param ms - Milliseconds to sleep
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
