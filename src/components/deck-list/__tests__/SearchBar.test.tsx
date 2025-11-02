import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "../SearchBar";

describe("SearchBar", () => {
  const mockOnSearch = vi.fn();
  const defaultProps = {
    value: "",
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("✅ Debounce 300ms działa poprawnie", () => {
    it("should debounce onSearch calls by 300ms", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox", { name: /wyszukaj talię po nazwie/i });

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
      });

      // Assert - onSearch should not be called immediately
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance timers by 299ms
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance timers by 1ms more (total 300ms)
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Assert - onSearch should be called after 300ms
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });

    it("should wait exactly 300ms before calling onSearch", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "search term" } });
      });

      // Assert - not called before 300ms
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance by exactly 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called after 300ms
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("search term");
    });

    it("should debounce multiple character inputs", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type multiple characters quickly
      act(() => {
        fireEvent.change(input, { target: { value: "a" } });
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        fireEvent.change(input, { target: { value: "ab" } });
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        fireEvent.change(input, { target: { value: "abc" } });
      });

      // Assert - onSearch not called yet
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - wait for debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called once with final value
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("abc");
    });

    it("should debounce when clearing input", () => {
      // Arrange
      render(<SearchBar {...defaultProps} value="initial" />);
      const input = screen.getByRole("textbox");

      // Act - clear input
      act(() => {
        fireEvent.change(input, { target: { value: "" } });
      });

      // Assert - not called immediately
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called with empty string
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should handle rapid typing and debounce correctly", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type very quickly
      act(() => {
        fireEvent.change(input, { target: { value: "hello world" } });
      });

      // Assert - should not be called during typing
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - wait for debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called once with complete text
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("hello world");
    });
  });

  describe("✅ Anulowanie poprzedniego timera przy szybkim pisaniu", () => {
    it("should cancel previous timer when typing continues", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type first character
      act(() => {
        fireEvent.change(input, { target: { value: "a" } });
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Act - type second character before debounce completes
      act(() => {
        fireEvent.change(input, { target: { value: "ab" } });
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Assert - onSearch not called yet (timer was reset)
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - complete the debounce period
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Assert - called once with final value
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("ab");
    });

    it("should reset timer on each keystroke", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type multiple characters with delays
      act(() => {
        fireEvent.change(input, { target: { value: "t" } });
        vi.advanceTimersByTime(100);
        fireEvent.change(input, { target: { value: "te" } });
        vi.advanceTimersByTime(100);
        fireEvent.change(input, { target: { value: "tes" } });
        vi.advanceTimersByTime(100);
        fireEvent.change(input, { target: { value: "test" } });
      });

      // Assert - no calls yet
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - wait for final debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called once with complete text
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });

    it("should not call onSearch multiple times during rapid typing", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - simulate very rapid typing
      act(() => {
        for (let i = 1; i <= 10; i++) {
          fireEvent.change(input, { target: { value: "a".repeat(i) } });
          vi.advanceTimersByTime(50);
        }
      });

      // Assert - no calls during typing
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - wait for debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called only once
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it("should handle backspace during debounce period", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type and then backspace
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
        vi.advanceTimersByTime(200);
        fireEvent.change(input, { target: { value: "tes" } });
      });

      // Assert - timer should be reset
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - complete debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - called with text after backspace
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("tes");
    });

    it("should cancel timer when value changes rapidly", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type, wait a bit, type more
      act(() => {
        fireEvent.change(input, { target: { value: "hello" } });
        vi.advanceTimersByTime(250);
        fireEvent.change(input, { target: { value: "hello world" } });
      });

      // Assert - first timer should be cancelled
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - complete second timer
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Assert - called once with final value
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("hello world");
    });
  });

  describe("✅ Synchronizacja localValue z zewnętrznym value", () => {
    it("should initialize with external value prop", () => {
      // Arrange & Act
      render(<SearchBar value="initial value" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Assert
      expect(input).toHaveValue("initial value");
    });

    it("should update when external value prop changes", () => {
      // Arrange
      const { rerender } = render(<SearchBar value="first" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Assert initial value
      expect(input).toHaveValue("first");

      // Act - update external value
      rerender(<SearchBar value="second" onSearch={mockOnSearch} />);

      // Assert - input should update
      expect(input).toHaveValue("second");
    });

    it("should sync with empty string value", () => {
      // Arrange
      const { rerender } = render(<SearchBar value="something" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveValue("something");

      // Act - clear external value
      rerender(<SearchBar value="" onSearch={mockOnSearch} />);

      // Assert
      expect(input).toHaveValue("");
    });

    it("should override local changes when external value changes", () => {
      // Arrange
      const { rerender } = render(<SearchBar value="" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Act - user types locally
      act(() => {
        fireEvent.change(input, { target: { value: "local" } });
      });
      expect(input).toHaveValue("local");

      // Act - external value changes
      rerender(<SearchBar value="external" onSearch={mockOnSearch} />);

      // Assert - external value takes precedence
      expect(input).toHaveValue("external");
    });

    it("should handle multiple external value updates", () => {
      // Arrange
      const { rerender } = render(<SearchBar value="first" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Act & Assert - multiple updates
      expect(input).toHaveValue("first");

      rerender(<SearchBar value="second" onSearch={mockOnSearch} />);
      expect(input).toHaveValue("second");

      rerender(<SearchBar value="third" onSearch={mockOnSearch} />);
      expect(input).toHaveValue("third");

      rerender(<SearchBar value="" onSearch={mockOnSearch} />);
      expect(input).toHaveValue("");
    });

    it("should sync with special characters in value", () => {
      // Arrange
      const specialValue = "test@#$%^&*()";
      render(<SearchBar value={specialValue} onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Assert
      expect(input).toHaveValue(specialValue);
    });

    it("should sync with unicode characters", () => {
      // Arrange
      const unicodeValue = "测试 🎉 тест";
      render(<SearchBar value={unicodeValue} onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Assert
      expect(input).toHaveValue(unicodeValue);
    });
  });

  describe("✅ Wywołanie onSearch z prawidłową wartością", () => {
    it("should call onSearch with typed value after debounce", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "search query" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("search query");
    });

    it("should call onSearch with empty string when cleared", () => {
      // Arrange
      render(<SearchBar value="initial" onSearch={mockOnSearch} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should call onSearch with trimmed whitespace preserved", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type with spaces
      act(() => {
        fireEvent.change(input, { target: { value: "  test query  " } });
        vi.advanceTimersByTime(300);
      });

      // Assert - spaces should be preserved (trimming happens in parent)
      expect(mockOnSearch).toHaveBeenCalledWith("  test query  ");
    });

    it("should call onSearch with special characters", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "test@#$%" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("test@#$%");
    });

    it("should call onSearch with numbers", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "12345" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("12345");
    });

    it("should call onSearch with unicode characters", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "测试" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("测试");
    });

    it("should call onSearch with emojis", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "test 🎉" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("test 🎉");
    });

    it("should not call onSearch on initial render", () => {
      // Act
      render(<SearchBar value="initial" onSearch={mockOnSearch} />);

      // Assert - onSearch should not be called on mount
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("should call onSearch only once after typing stops", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledTimes(1);

      // Act - wait more time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert - still called only once
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it("should call onSearch multiple times for separate typing sessions", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - first typing session
      act(() => {
        fireEvent.change(input, { target: { value: "first" } });
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("first");

      // Act - second typing session
      act(() => {
        fireEvent.change(input, { target: { value: "" } });
        vi.advanceTimersByTime(300);
        fireEvent.change(input, { target: { value: "second" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledTimes(3); // first + clear + second
      expect(mockOnSearch).toHaveBeenLastCalledWith("second");
    });
  });

  describe("✅ Cleanup timera przy unmount", () => {
    it("should cleanup timer on unmount", () => {
      // Arrange
      const { unmount } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type and unmount before debounce completes
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
      });
      unmount();

      // Act - advance timers after unmount
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - onSearch should not be called after unmount
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("should not call onSearch if unmounted during debounce", () => {
      // Arrange
      const { unmount } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: "search term" } });
        vi.advanceTimersByTime(200);
      });

      // Unmount before debounce completes
      unmount();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Assert
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("should cleanup multiple timers on unmount", () => {
      // Arrange
      const { unmount } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - create multiple timers
      act(() => {
        fireEvent.change(input, { target: { value: "a" } });
        vi.advanceTimersByTime(100);
        fireEvent.change(input, { target: { value: "ab" } });
        vi.advanceTimersByTime(100);
        fireEvent.change(input, { target: { value: "abc" } });
      });

      // Unmount
      unmount();

      // Advance all timers
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert - no calls after unmount
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("should handle unmount immediately after typing", () => {
      // Arrange
      const { unmount } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type and immediately unmount
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
      });
      unmount();

      // Assert - should not throw error
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(300);
        });
      }).not.toThrow();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("should handle unmount without any interaction", () => {
      // Arrange
      const { unmount } = render(<SearchBar {...defaultProps} />);

      // Act & Assert - should not throw
      expect(() => unmount()).not.toThrow();
    });

    it("should cleanup timer when component rerenders", () => {
      // Arrange
      const { rerender } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act - type
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
        vi.advanceTimersByTime(200);
      });

      // Rerender with new props
      rerender(<SearchBar value="new" onSearch={mockOnSearch} />);

      // Advance remaining time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Assert - old timer should be cleaned up
      // New value from props should be set
      expect(input).toHaveValue("new");
    });
  });

  describe("Accessibility and UI", () => {
    it("should render with correct accessibility attributes", () => {
      // Arrange & Act
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Assert
      expect(input).toHaveAttribute("id", "search-decks");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("aria-label", "Wyszukaj talię po nazwie");
    });

    it("should have screen reader only label", () => {
      // Arrange & Act
      render(<SearchBar {...defaultProps} />);
      const label = screen.getByText("Search decks");

      // Assert
      expect(label).toHaveClass("sr-only");
    });

    it("should display placeholder text", () => {
      // Arrange & Act
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText("Wyszukaj talię po nazwie...");

      // Assert
      expect(input).toBeInTheDocument();
    });

    it("should be focusable", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      input.focus();

      // Assert
      expect(input).toHaveFocus();
    });

    it("should allow typing when focused", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      fireEvent.focus(input);
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
      });

      // Assert
      expect(input).toHaveValue("test");
    });
  });

  describe("Edge cases", () => {
    it("should handle very long input strings", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");
      const longString = "a".repeat(1000);

      // Act
      act(() => {
        fireEvent.change(input, { target: { value: longString } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith(longString);
    });

    it("should handle paste events", () => {
      // Arrange
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByRole("textbox");

      // Act
      act(() => {
        fireEvent.paste(input);
        fireEvent.change(input, { target: { value: "pasted text" } });
        vi.advanceTimersByTime(300);
      });

      // Assert
      expect(mockOnSearch).toHaveBeenCalledWith("pasted text");
    });

    it("should handle onSearch callback changes", () => {
      // Arrange
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { rerender } = render(<SearchBar value="" onSearch={firstCallback} />);
      const input = screen.getByRole("textbox");

      // Act - type with first callback
      act(() => {
        fireEvent.change(input, { target: { value: "test" } });
      });

      // Change callback before debounce completes
      rerender(<SearchBar value="" onSearch={secondCallback} />);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - new callback should be called
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith("test");
    });

    it("should handle rapid mount/unmount cycles", () => {
      // Act & Assert - should not throw
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<SearchBar {...defaultProps} />);
        unmount();
      }

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });
});
