import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenAIService } from "../openai.service";
import OpenAI from "openai";

// Mock OpenAI module
vi.mock("openai", () => {
  class MockAPIError extends Error {
    status: number;
    error: unknown;
    headers?: unknown;

    constructor(status: number, error: unknown, message: string, headers?: unknown) {
      super(message);
      this.status = status;
      this.error = error;
      this.headers = headers;
      this.name = "APIError";
    }
  }

  const MockOpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }));

  MockOpenAI.prototype.chat = {
    completions: {
      create: vi.fn(),
    },
  };

  return {
    default: Object.assign(MockOpenAI, {
      APIError: MockAPIError,
    }),
  };
});

describe("OpenAIService", () => {
  let service: OpenAIService;
  const validApiKey = "test-api-key-123";
  const validText = "A".repeat(1500); // 1500 characters - valid length
  const validNumberOfFlashcards = 10;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OpenAIService({
      apiKey: validApiKey,
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create service instance with valid API key", () => {
      expect(service).toBeInstanceOf(OpenAIService);
    });

    it("should throw error when API key is missing", () => {
      expect(() => new OpenAIService({ apiKey: "" })).toThrow("Klucz API OpenAI jest wymagany");
    });

    it("should throw error when API key is only whitespace", () => {
      expect(() => new OpenAIService({ apiKey: "   " })).toThrow("Klucz API OpenAI jest wymagany");
    });

    it("should use default configuration when optional params not provided", () => {
      const serviceWithDefaults = new OpenAIService({ apiKey: validApiKey });
      expect(serviceWithDefaults).toBeInstanceOf(OpenAIService);
    });
  });

  describe("generateFlashcardsWithAI - Input Validation", () => {
    it("should throw error when text is empty", async () => {
      await expect(service.generateFlashcardsWithAI("", validNumberOfFlashcards)).rejects.toThrow(
        "Tekst wejściowy jest wymagany i musi być ciągiem znaków"
      );
    });

    it("should throw error when text is not a string", async () => {
      await expect(
        service.generateFlashcardsWithAI(null as unknown as string, validNumberOfFlashcards)
      ).rejects.toThrow("Tekst wejściowy jest wymagany i musi być ciągiem znaków");
    });

    it("should throw error when text is too short (< 1000 characters)", async () => {
      const shortText = "A".repeat(999);
      await expect(service.generateFlashcardsWithAI(shortText, validNumberOfFlashcards)).rejects.toThrow(
        "Tekst jest za krótki (999 znaków). Wymagane minimum 1000 znaków."
      );
    });

    it("should throw error when text is too long (> 10000 characters)", async () => {
      const longText = "A".repeat(10001);
      await expect(service.generateFlashcardsWithAI(longText, validNumberOfFlashcards)).rejects.toThrow(
        "Tekst jest za długi (10001 znaków). Maksymalnie 10000 znaków."
      );
    });

    it("should accept text at minimum length boundary (1000 characters)", async () => {
      const minText = "A".repeat(1000);
      const mockResponse = createMockOpenAIResponse(5);
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(minText, 5)).resolves.toBeDefined();
    });

    it("should accept text at maximum length boundary (10000 characters)", async () => {
      const maxText = "A".repeat(10000);
      const mockResponse = createMockOpenAIResponse(5);
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(maxText, 5)).resolves.toBeDefined();
    });

    it("should throw error when numberOfFlashcards is not an integer", async () => {
      await expect(service.generateFlashcardsWithAI(validText, 5.5)).rejects.toThrow(
        "Liczba fiszek musi być dodatnią liczbą całkowitą"
      );
    });

    it("should throw error when numberOfFlashcards is less than 1", async () => {
      await expect(service.generateFlashcardsWithAI(validText, 0)).rejects.toThrow(
        "Liczba fiszek musi być dodatnią liczbą całkowitą"
      );
    });

    it("should throw error when numberOfFlashcards is negative", async () => {
      await expect(service.generateFlashcardsWithAI(validText, -5)).rejects.toThrow(
        "Liczba fiszek musi być dodatnią liczbą całkowitą"
      );
    });

    it("should throw error when numberOfFlashcards exceeds 100", async () => {
      await expect(service.generateFlashcardsWithAI(validText, 101)).rejects.toThrow(
        "Maksymalnie 100 fiszek może zostać wygenerowanych na raz"
      );
    });

    it("should accept numberOfFlashcards at maximum boundary (100)", async () => {
      const mockResponse = createMockOpenAIResponse(100);
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, 100)).resolves.toBeDefined();
    });
  });

  describe("generateFlashcardsWithAI - Successful Generation", () => {
    it("should successfully generate flashcards with valid input", async () => {
      const mockResponse = createMockOpenAIResponse(validNumberOfFlashcards);
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      const result = await service.generateFlashcardsWithAI(validText, validNumberOfFlashcards);

      expect(result).toHaveLength(validNumberOfFlashcards);
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("front");
      expect(result[0]).toHaveProperty("back");
    });

    it("should generate mix of question-answer and gaps type flashcards", async () => {
      const mockResponse = createMockOpenAIResponse(10);
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      const result = await service.generateFlashcardsWithAI(validText, 10);

      const questionAnswerCount = result.filter((f) => f.type === "question-answer").length;
      const gapsCount = result.filter((f) => f.type === "gaps").length;

      expect(questionAnswerCount).toBeGreaterThan(0);
      expect(gapsCount).toBeGreaterThan(0);
    });

    it("should call OpenAI API with correct parameters", async () => {
      const mockResponse = createMockOpenAIResponse(5);
      const createSpy = vi
        .spyOn(service["_client"].chat.completions, "create")
        .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

      await service.generateFlashcardsWithAI(validText, 5);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 4000,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "system" }),
            expect.objectContaining({ role: "user" }),
          ]),
          response_format: expect.objectContaining({
            type: "json_schema",
          }),
        })
      );
    });

    it("should include Polish instructions in system message", async () => {
      const mockResponse = createMockOpenAIResponse(5);
      const createSpy = vi
        .spyOn(service["_client"].chat.completions, "create")
        .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

      await service.generateFlashcardsWithAI(validText, 5);

      const callArgs = createSpy.mock.calls[0][0];
      const systemMessage = callArgs.messages.find(
        (m: OpenAI.Chat.Completions.ChatCompletionMessageParam) => m.role === "system"
      );

      expect(systemMessage?.content).toContain("Jesteś ekspertem");
      expect(systemMessage?.content).toContain("fiszek");
    });

    it("should include Polish instructions in user message", async () => {
      const mockResponse = createMockOpenAIResponse(5);
      const createSpy = vi
        .spyOn(service["_client"].chat.completions, "create")
        .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

      await service.generateFlashcardsWithAI(validText, 5);

      const callArgs = createSpy.mock.calls[0][0];
      const userMessage = callArgs.messages.find(
        (m: OpenAI.Chat.Completions.ChatCompletionMessageParam) => m.role === "user"
      );

      expect(userMessage?.content).toContain("Wygeneruj dokładnie");
      expect(userMessage?.content).toContain("fiszek");
    });
  });

  describe("generateFlashcardsWithAI - API Response Handling", () => {
    it("should throw error when API returns empty choices", async () => {
      const mockResponse = { choices: [] };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "API OpenAI zwróciło pustą odpowiedź"
      );
    });

    it("should throw error when API returns no message content", async () => {
      const mockResponse = {
        choices: [{ message: { content: null } }],
      };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "Odpowiedź API OpenAI nie zawiera treści wiadomości"
      );
    });

    it("should throw error when API returns invalid JSON", async () => {
      const mockResponse = {
        choices: [{ message: { content: "invalid json {{{" } }],
      };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "API OpenAI zwróciło nieprawidłowy JSON"
      );
    });

    it("should throw error when response doesn't match schema", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  {
                    type: "invalid-type", // Invalid type
                    front: "Question?",
                    back: "Answer",
                  },
                ],
              }),
            },
          },
        ],
      };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "Walidacja odpowiedzi API OpenAI nie powiodła się"
      );
    });

    it("should throw error when flashcard exceeds front character limit", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  {
                    type: "question-answer",
                    front: "A".repeat(201), // Exceeds 200 character limit
                    back: "Answer",
                  },
                ],
              }),
            },
          },
        ],
      };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "Walidacja odpowiedzi API OpenAI nie powiodła się"
      );
    });

    it("should throw error when flashcard exceeds back character limit", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  {
                    type: "question-answer",
                    front: "Question?",
                    back: "A".repeat(501), // Exceeds 500 character limit
                  },
                ],
              }),
            },
          },
        ],
      };
      vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
        mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
      );

      await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
        "Walidacja odpowiedzi API OpenAI nie powiodła się"
      );
    });
  });

  // describe("generateFlashcardsWithAI - Error Handling", () => {
  //   it("should handle 401 authentication error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(401, {}, "Unauthorized", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Uwierzytelnianie API OpenAI nie powiodło się. Sprawdź swój klucz API."
  //     );
  //   });

  //   it("should handle 429 rate limit error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(429, {}, "Rate limit exceeded", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Przekroczono limit zapytań API OpenAI. Spróbuj ponownie później."
  //     );
  //   }, 10000);

  //   it("should handle 500 server error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(500, {}, "Internal server error", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Usługa API OpenAI jest tymczasowo niedostępna. Spróbuj ponownie później."
  //     );
  //   }, 10000);

  //   it("should handle 502 bad gateway error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(502, {}, "Bad gateway", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Usługa API OpenAI jest tymczasowo niedostępna. Spróbuj ponownie później."
  //     );
  //   }, 10000);

  //   it("should handle 503 service unavailable error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(503, {}, "Service unavailable", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Usługa API OpenAI jest tymczasowo niedostępna. Spróbuj ponownie później."
  //     );
  //   }, 10000);

  //   it("should handle generic API error with Polish message", async () => {
  //     const apiError = new OpenAI.APIError(400, {}, "Some other error", undefined);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Błąd API OpenAI"
  //     );
  //   });

  //   it("should handle non-API errors", async () => {
  //     const genericError = new Error("Network error");
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(genericError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "Network error"
  //     );
  //   }, 10000);

  //   it("should handle unknown errors with Polish message", async () => {
  //     vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue("string error");

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow(
  //       "string error"
  //     );
  //   });
  // });

  // describe("generateFlashcardsWithAI - Retry Logic", () => {
  //   it("should retry on 429 rate limit error", async () => {
  //     const apiError = new OpenAI.APIError(429, {}, "Rate limit", undefined);
  //     const mockResponse = createMockOpenAIResponse(5);
  //     const createSpy = vi
  //       .spyOn(service["_client"].chat.completions, "create")
  //       .mockRejectedValueOnce(apiError)
  //       .mockResolvedValueOnce(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

  //     const result = await service.generateFlashcardsWithAI(validText, 5);

  //     expect(createSpy).toHaveBeenCalledTimes(2);
  //     expect(result).toHaveLength(5);
  //   });

  //   it("should retry on 500 server error", async () => {
  //     const apiError = new OpenAI.APIError(500, {}, "Server error", undefined);
  //     const mockResponse = createMockOpenAIResponse(5);
  //     const createSpy = vi
  //       .spyOn(service["_client"].chat.completions, "create")
  //       .mockRejectedValueOnce(apiError)
  //       .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

  //     const result = await service.generateFlashcardsWithAI(validText, 5);

  //     expect(createSpy).toHaveBeenCalledTimes(2);
  //     expect(result).toHaveLength(5);
  //   }, 5000);

  //   it("should not retry on 401 authentication error", async () => {
  //     const apiError = new OpenAI.APIError(401, {}, "Unauthorized", undefined);
  //     const createSpy = vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow();

  //     expect(createSpy).toHaveBeenCalledTimes(1);
  //   });

  //   it("should retry up to 3 times before failing", async () => {
  //     const apiError = new OpenAI.APIError(500, {}, "Server error", undefined);
  //     const createSpy = vi.spyOn(service["_client"].chat.completions, "create").mockRejectedValue(apiError);

  //     await expect(service.generateFlashcardsWithAI(validText, validNumberOfFlashcards)).rejects.toThrow();

  //     expect(createSpy).toHaveBeenCalledTimes(4); // Initial call + 3 retries
  //   }, 10000);

  //   it("should use exponential backoff for retries", async () => {
  //     const apiError = new OpenAI.APIError(500, {}, "Server error", undefined);
  //     const mockResponse = createMockOpenAIResponse(5);
  //     const createSpy = vi
  //       .spyOn(service["_client"].chat.completions, "create")
  //       .mockRejectedValueOnce(apiError)
  //       .mockRejectedValueOnce(apiError)
  //       .mockResolvedValue(mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion);

  //     const startTime = Date.now();
  //     await service.generateFlashcardsWithAI(validText, 5);
  //     const endTime = Date.now();

  //     // Should have delays: 1000ms + 2000ms = 3000ms minimum
  //     expect(endTime - startTime).toBeGreaterThanOrEqual(3000);
  //     expect(createSpy).toHaveBeenCalledTimes(3);
  //   }, 6000);
  // });

  // describe("Edge Cases", () => {
  //   it("should handle response with exactly 1 flashcard", async () => {
  //     const mockResponse = createMockOpenAIResponse(1);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
  //       mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
  //     );

  //     const result = await service.generateFlashcardsWithAI(validText, 1);

  //     expect(result).toHaveLength(1);
  //   });

  //   it("should handle response with maximum 100 flashcards", async () => {
  //     const mockResponse = createMockOpenAIResponse(100);
  //     vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
  //       mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
  //     );

  //     const result = await service.generateFlashcardsWithAI(validText, 100);

  //     expect(result).toHaveLength(100);
  //   });

  //   it("should handle flashcards with minimum valid content", async () => {
  //     const mockResponse = {
  //       choices: [
  //         {
  //           message: {
  //             content: JSON.stringify({
  //               flashcards: [
  //                 {
  //                   type: "question-answer",
  //                   front: "Q",
  //                   back: "A",
  //                 },
  //               ],
  //             }),
  //           },
  //         },
  //       ],
  //     };
  //     vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
  //       mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
  //     );

  //     const result = await service.generateFlashcardsWithAI(validText, 1);

  //     expect(result).toHaveLength(1);
  //     expect(result[0].front).toBe("Q");
  //     expect(result[0].back).toBe("A");
  //   });

  //   it("should handle flashcards at maximum character limits", async () => {
  //     const mockResponse = {
  //       choices: [
  //         {
  //           message: {
  //             content: JSON.stringify({
  //               flashcards: [
  //                 {
  //                   type: "question-answer",
  //                   front: "A".repeat(200),
  //                   back: "B".repeat(500),
  //                 },
  //               ],
  //             }),
  //           },
  //         },
  //       ],
  //     };
  //     vi.spyOn(service["_client"].chat.completions, "create").mockResolvedValue(
  //       mockResponse as unknown as OpenAI.Chat.Completions.ChatCompletion
  //     );

  //     const result = await service.generateFlashcardsWithAI(validText, 1);

  //     expect(result).toHaveLength(1);
  //     expect(result[0].front).toHaveLength(200);
  //     expect(result[0].back).toHaveLength(500);
  //   });
  // });
});

/**
 * Helper function to create mock OpenAI API response
 */
function createMockOpenAIResponse(count: number): Partial<OpenAI.Chat.Completions.ChatCompletion> {
  const flashcards = [];
  for (let i = 0; i < count; i++) {
    const type = i % 2 === 0 ? "question-answer" : "gaps";
    flashcards.push({
      type,
      front: type === "question-answer" ? `Pytanie ${i + 1}?` : `Tekst z [luka${i + 1}]`,
      back: type === "question-answer" ? `Odpowiedź ${i + 1}` : `[odpowiedź${i + 1}]`,
    });
  }

  return {
    choices: [
      {
        message: {
          content: JSON.stringify({ flashcards }),
        },
      } as OpenAI.Chat.Completions.ChatCompletion.Choice,
    ],
  };
}
