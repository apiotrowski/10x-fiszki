import { describe, it, expect } from "vitest";
import { calculateTextHash, calculateTextLength } from "../utils.server";

describe("utils.server", () => {
  describe("calculateTextHash", () => {
    it("should generate consistent SHA-256 hash for same input", () => {
      const text = "Hello, World!";
      const hash1 = calculateTextHash(text);
      const hash2 = calculateTextHash(text);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it("should generate different hashes for different inputs", () => {
      const text1 = "Hello, World!";
      const text2 = "Hello, World?";

      const hash1 = calculateTextHash(text1);
      const hash2 = calculateTextHash(text2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", () => {
      const hash = calculateTextHash("");
      expect(hash).toHaveLength(64);
      expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    });

    it("should handle unicode characters", () => {
      const text = "Cześć! 你好 🎉";
      const hash = calculateTextHash(text);

      expect(hash).toHaveLength(64);
      expect(typeof hash).toBe("string");
    });

    it("should be case-sensitive", () => {
      const hash1 = calculateTextHash("Hello");
      const hash2 = calculateTextHash("hello");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("calculateTextLength", () => {
    it("should return correct length for simple text", () => {
      expect(calculateTextLength("Hello")).toBe(5);
      expect(calculateTextLength("Hello, World!")).toBe(13);
    });

    it("should return 0 for empty string", () => {
      expect(calculateTextLength("")).toBe(0);
    });

    it("should count unicode characters correctly", () => {
      expect(calculateTextLength("🎉")).toBe(2); // Emoji counts as 2 characters in JS
      expect(calculateTextLength("Cześć")).toBe(5);
      expect(calculateTextLength("你好")).toBe(2);
    });

    it("should count whitespace and newlines", () => {
      expect(calculateTextLength("Hello World")).toBe(11);
      expect(calculateTextLength("Hello\nWorld")).toBe(11);
      expect(calculateTextLength("Hello\tWorld")).toBe(11);
    });
  });
});
