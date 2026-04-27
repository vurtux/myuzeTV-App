import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { GenreChips } from "../../components/GenreChips";

describe("GenreChips", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders all genre options including 'All'", () => {
    render(<GenreChips selectedGenre="all" onSelect={mockOnSelect} />);

    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Romance")).toBeTruthy();
    expect(screen.getByText("Thriller")).toBeTruthy();
    expect(screen.getByText("Fantasy")).toBeTruthy();
    expect(screen.getByText("Comedy")).toBeTruthy();
    expect(screen.getByText("Family Drama")).toBeTruthy();
  });

  it("calls onSelect with genre value when tapped", () => {
    render(<GenreChips selectedGenre="all" onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText("Romance"));
    expect(mockOnSelect).toHaveBeenCalledWith("romance");
  });

  it("calls onSelect with 'all' when All chip is tapped", () => {
    render(<GenreChips selectedGenre="romance" onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText("All"));
    expect(mockOnSelect).toHaveBeenCalledWith("all");
  });
});
