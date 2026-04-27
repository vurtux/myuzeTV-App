import React from "react";
import { render, screen } from "@testing-library/react";
import { StarRating } from "../../components/StarRating";

describe("StarRating", () => {
  it("renders numeric rating text", () => {
    render(<StarRating rating={4.5} />);
    expect(screen.getByText("4.5")).toBeTruthy();
  });

  it("renders review count when provided", () => {
    render(<StarRating rating={4.0} reviewCount="5.1K" />);
    expect(screen.getByText("(5.1K reviews)")).toBeTruthy();
  });

  it("does not render review count when not provided", () => {
    render(<StarRating rating={3.0} />);
    expect(screen.queryByText("reviews")).toBeNull();
  });

  it("renders rating for 0 stars", () => {
    render(<StarRating rating={0} />);
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("renders rating for 5 stars", () => {
    render(<StarRating rating={5} />);
    expect(screen.getByText("5")).toBeTruthy();
  });
});
