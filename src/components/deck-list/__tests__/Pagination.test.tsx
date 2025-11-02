import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../Pagination";
import type { PaginationDTO } from "../../../types";

describe("Pagination", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("✅ getPageNumbers() dla małej liczby stron (≤7)", () => {
    it("should display all pages when total is 1", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 5,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show only page 1
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();
    });

    it("should display all pages when total is 3", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 25,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show pages 1, 2, 3
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 3" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 4" })).not.toBeInTheDocument();
    });

    it("should display all pages when total is exactly 7", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 4,
        limit: 10,
        total: 70,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show all 7 pages
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByRole("button", { name: `Go to page ${i}` })).toBeInTheDocument();
      }
      expect(screen.queryByRole("button", { name: "Go to page 8" })).not.toBeInTheDocument();
    });

    it("should not display ellipsis for small page counts", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 2,
        limit: 10,
        total: 50,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - no ellipsis should be present
      expect(screen.queryByText("...")).not.toBeInTheDocument();
    });

    it("should display all pages from 1 to 5", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 3,
        limit: 10,
        total: 50,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 4" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 5" })).toBeInTheDocument();
    });
  });

  describe("✅ getPageNumbers() dla dużej liczby stron (>7)", () => {
    it("should display ellipsis for large page counts", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show ellipsis
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it("should show first page, ellipsis, middle pages, ellipsis, last page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
      expect(screen.getAllByText("...")).toHaveLength(2);
    });

    it("should display pages around current page for middle position", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 200,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show pages around current (9, 10, 11)
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 9" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 11" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 20" })).toBeInTheDocument();
    });

    it("should handle very large page counts (100+ pages)", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 50,
        limit: 10,
        total: 1000,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 100" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 50" })).toBeInTheDocument();
    });

    it("should show correct pages when near the beginning", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 2,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show 1, 2, 3, ..., 10
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
    });

    it("should show correct pages when near the end", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 9,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show 1, ..., 8, 9, 10
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 8" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 9" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
    });
  });

  describe("✅ Poprawne wyświetlanie '...' (ellipsis)", () => {
    it("should display left ellipsis when current page > 3", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it("should not display left ellipsis when current page <= 3", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 3,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should only have right ellipsis
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBe(1);
    });

    it("should display right ellipsis when current page < totalPages - 2", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBe(2);
    });

    it("should not display right ellipsis when near the end", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 9,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should only have left ellipsis
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBe(1);
    });

    it("should display both ellipses for middle pages", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 200,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBe(2);
    });

    it("should have aria-hidden on ellipsis elements", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      const { container } = render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const ellipsisElements = container.querySelectorAll('[aria-hidden="true"]');
      const ellipsisWithText = Array.from(ellipsisElements).filter((el) => el.textContent === "...");
      expect(ellipsisWithText.length).toBeGreaterThan(0);
    });
  });

  describe("✅ Obsługa edge cases (strona 1, ostatnia strona)", () => {
    it("should handle page 1 correctly", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const page1Button = screen.getByRole("button", { name: "Go to page 1" });
      expect(page1Button).toHaveAttribute("aria-current", "page");
    });

    it("should handle last page correctly", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const page10Button = screen.getByRole("button", { name: "Go to page 10" });
      expect(page10Button).toHaveAttribute("aria-current", "page");
    });

    it("should disable Previous button on first page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      expect(previousButton).toBeDisabled();
    });

    it("should disable Next button on last page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(nextButton).toBeDisabled();
    });

    it("should handle single page scenario", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 5,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it("should handle page 2 of 2", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 2,
        limit: 10,
        total: 20,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(previousButton).not.toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe("✅ Walidacja currentPage (min/max bounds)", () => {
    it("should clamp page to minimum of 1", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 0,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should treat as page 1
      const page1Button = screen.getByRole("button", { name: "Go to page 1" });
      expect(page1Button).toHaveAttribute("aria-current", "page");
    });

    it("should clamp page to maximum of totalPages", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 999,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should treat as page 10 (last page)
      const page10Button = screen.getByRole("button", { name: "Go to page 10" });
      expect(page10Button).toHaveAttribute("aria-current", "page");
    });

    it("should handle negative page numbers", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: -5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should treat as page 1
      const page1Button = screen.getByRole("button", { name: "Go to page 1" });
      expect(page1Button).toHaveAttribute("aria-current", "page");
    });

    it("should handle page number exceeding total pages", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 50,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should clamp to page 10
      const page10Button = screen.getByRole("button", { name: "Go to page 10" });
      expect(page10Button).toHaveAttribute("aria-current", "page");
    });

    it("should handle valid page within bounds", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const page5Button = screen.getByRole("button", { name: "Go to page 5" });
      expect(page5Button).toHaveAttribute("aria-current", "page");
    });
  });

  describe("✅ Obliczanie totalPages", () => {
    it("should calculate totalPages correctly for exact division", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 10 pages
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 11" })).not.toBeInTheDocument();
    });

    it("should calculate totalPages with remainder", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 95,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 10 pages (95/10 = 9.5, rounded up to 10)
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 11" })).not.toBeInTheDocument();
    });

    it("should handle total less than limit", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 5,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 1 page
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();
    });

    it("should handle total equal to limit", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 10,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 1 page
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();
    });

    it("should handle total = limit + 1", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 11,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 2 pages
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 3" })).not.toBeInTheDocument();
    });

    it("should handle zero total", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 0,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 0 pages (no page buttons)
      expect(screen.queryByRole("button", { name: /Go to page/i })).not.toBeInTheDocument();
    });

    it("should handle large totals correctly", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 10000,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 1000 pages
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 1000" })).toBeInTheDocument();
    });
  });

  describe("✅ Disable buttons (Previous na str. 1, Next na ostatniej)", () => {
    it("should disable Previous button on page 1", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      expect(previousButton).toBeDisabled();
    });

    it("should enable Previous button on page 2", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 2,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      expect(previousButton).not.toBeDisabled();
    });

    it("should disable Next button on last page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(nextButton).toBeDisabled();
    });

    it("should enable Next button on page before last", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 9,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(nextButton).not.toBeDisabled();
    });

    it("should not call onPageChange when Previous is clicked on page 1", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      fireEvent.click(previousButton);

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should not call onPageChange when Next is clicked on last page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 10,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      fireEvent.click(nextButton);

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should enable both buttons on middle pages", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      expect(previousButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("User interactions and callbacks", () => {
    it("should call onPageChange when clicking a page number", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const page2Button = screen.getByRole("button", { name: "Go to page 2" });
      fireEvent.click(page2Button);

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledTimes(1);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("should call onPageChange when clicking Previous button", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      fireEvent.click(previousButton);

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledTimes(1);
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it("should call onPageChange when clicking Next button", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      fireEvent.click(nextButton);

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledTimes(1);
      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });

    it("should not call onPageChange when clicking current page", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      const page5Button = screen.getByRole("button", { name: "Go to page 5" });
      fireEvent.click(page5Button);

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should not call onPageChange when clicking ellipsis", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      const { container } = render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
      // Find ellipsis span (not SVG with aria-hidden)
      const ellipsisSpans = Array.from(container.querySelectorAll('span[aria-hidden="true"]')).filter(
        (el) => el.textContent === "..."
      );

      if (ellipsisSpans.length > 0) {
        fireEvent.click(ellipsisSpans[0]);
      }

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should handle multiple page changes", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Page 5 shows: 1, ..., 4, 5, 6, ..., 10
      const page4Button = screen.getByRole("button", { name: "Go to page 4" });
      fireEvent.click(page4Button);

      const previousButton = screen.getByRole("button", { name: /poprzedniej strony/i });
      fireEvent.click(previousButton);

      const nextButton = screen.getByRole("button", { name: /następnej strony/i });
      fireEvent.click(nextButton);

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledTimes(3);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(1, 4);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(2, 4);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(3, 6);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const currentPageButton = screen.getByRole("button", { name: "Go to page 5" });
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });

    it("should not mark non-current pages with aria-current", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const page4Button = screen.getByRole("button", { name: "Go to page 4" });
      expect(page4Button).not.toHaveAttribute("aria-current");
    });

    it("should have aria-label for page buttons", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 50,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
    });

    it("should have aria-hidden on ellipsis", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 5,
        limit: 10,
        total: 100,
      };

      // Act
      const { container } = render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert
      const ellipsisElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });
  });

  describe("Edge cases and special scenarios", () => {
    it("should handle fractional limit values", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 95,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should round up to 10 pages
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
    });

    it("should handle very small limits", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 1,
        total: 10,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 10 pages
      expect(screen.getByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
    });

    it("should handle very large limits", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 1,
        limit: 1000,
        total: 100,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should have 1 page
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();
    });

    it("should render correctly with exactly 8 total pages", () => {
      // Arrange
      const pagination: PaginationDTO = {
        page: 4,
        limit: 10,
        total: 80,
      };

      // Act
      render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);

      // Assert - should show ellipsis for 8 pages
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 8" })).toBeInTheDocument();
    });
  });
});
