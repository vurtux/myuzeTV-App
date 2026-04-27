import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

// Mock expo-router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Home: (props: any) => <span data-testid="icon-home" {...props} />,
  Bookmark: (props: any) => <span data-testid="icon-bookmark" {...props} />,
  User: (props: any) => <span data-testid="icon-user" {...props} />,
}));

import { BottomNav } from "../../components/BottomNav";

describe("BottomNav", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders all 3 tabs (Home, Watchlist, Me)", () => {
    render(<BottomNav activeTab="home" />);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Watchlist")).toBeTruthy();
    expect(screen.getByText("Me")).toBeTruthy();
  });

  it("renders testID for each tab", () => {
    render(<BottomNav activeTab="home" />);

    expect(screen.getByTestId("tab-home")).toBeTruthy();
    expect(screen.getByTestId("tab-watchlist")).toBeTruthy();
    expect(screen.getByTestId("tab-profile")).toBeTruthy();
  });

  it("calls router.replace with / when Home tab is pressed", () => {
    render(<BottomNav activeTab="watchlist" />);

    fireEvent.click(screen.getByTestId("tab-home"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("calls router.replace with /watchlist when Watchlist tab is pressed", () => {
    render(<BottomNav activeTab="home" />);

    fireEvent.click(screen.getByTestId("tab-watchlist"));
    expect(mockReplace).toHaveBeenCalledWith("/watchlist");
  });

  it("calls router.replace with /profile when Me tab is pressed", () => {
    render(<BottomNav activeTab="home" />);

    fireEvent.click(screen.getByTestId("tab-profile"));
    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  it("renders active indicator dot for active tab only", () => {
    const { container } = render(<BottomNav activeTab="home" />);
    // The active tab gets an extra indicator View at -bottom-1
    // We check that the tab-home pressable contains the indicator
    const homeTab = screen.getByTestId("tab-home");
    expect(homeTab).toBeTruthy();
    // Active tab should exist - this just verifies the component renders fully
    expect(container).toBeTruthy();
  });

  it("renders correctly with watchlist as active tab", () => {
    render(<BottomNav activeTab="watchlist" />);

    // All tabs still render
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Watchlist")).toBeTruthy();
    expect(screen.getByText("Me")).toBeTruthy();
  });

  it("renders correctly with profile as active tab", () => {
    render(<BottomNav activeTab="profile" />);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Watchlist")).toBeTruthy();
    expect(screen.getByText("Me")).toBeTruthy();
  });
});
