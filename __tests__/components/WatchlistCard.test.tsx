import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: (props: any) => <img src={props.source?.uri} alt={props.alt || ""} />,
}));

// Mock lucide-react-native
jest.mock("lucide-react-native", () => ({
  X: (props: any) => <span data-testid="icon-x" {...props} />,
}));

// Mock DramaImage
jest.mock("../../components/DramaImage", () => ({
  DramaImage: ({ uri, alt }: { uri: string; alt: string }) => (
    <img src={uri} alt={alt} data-testid="drama-image" />
  ),
}));

// Mock date-utils
jest.mock("../../lib/date-utils", () => ({
  isRecent: jest.fn(() => false),
}));

import { WatchlistCard } from "../../components/WatchlistCard";
import { isRecent } from "../../lib/date-utils";

const mockDrama = {
  id: "love-in-accra",
  title: "Love in Accra",
  image: "https://cdn.test/poster.jpg",
  genre: "Romance",
};

describe("WatchlistCard", () => {
  const mockOnPress = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders drama title", () => {
    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("Love in Accra")).toBeTruthy();
  });

  it("renders drama genre", () => {
    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("Romance")).toBeTruthy();
  });

  it("renders DramaImage with correct URI", () => {
    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    const img = screen.getByTestId("drama-image");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("https://cdn.test/poster.jpg");
  });

  it("calls onPress when card is tapped", () => {
    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    // The outer Pressable is the card body
    const title = screen.getByText("Love in Accra");
    fireEvent.click(title);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when X button is pressed", () => {
    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    const removeBtn = screen.getByTestId("icon-x");
    // Click the parent pressable that contains the X icon
    fireEvent.click(removeBtn);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it("shows reduced opacity when isRemoving is true", () => {
    const { container } = render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
        isRemoving={true}
      />
    );

    // The outer View should have opacity-40 class
    expect(container).toBeTruthy();
  });

  it("shows full opacity when isRemoving is false", () => {
    const { container } = render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
        isRemoving={false}
      />
    );

    expect(container).toBeTruthy();
  });

  it("shows NEW badge when drama was recently inserted", () => {
    (isRecent as jest.Mock).mockReturnValue(true);

    render(
      <WatchlistCard
        drama={{ ...mockDrama, insertedAt: new Date().toISOString() }}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("NEW")).toBeTruthy();
  });

  it("does not show NEW badge when drama is not recent", () => {
    (isRecent as jest.Mock).mockReturnValue(false);

    render(
      <WatchlistCard
        drama={mockDrama}
        onPress={mockOnPress}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.queryByText("NEW")).toBeNull();
  });
});
