import { describe, it, expect, vi } from "vitest";

describe("Example Unit Test", () => {
  it("should pass a basic test", () => {
    expect(true).toBe(true);
  });

  it("should test a simple function", () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it("should work with mocks", () => {
    const mockFn = vi.fn();
    mockFn("test");

    expect(mockFn).toHaveBeenCalledWith("test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
