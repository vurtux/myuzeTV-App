// Mock reanimated — must use require inside factory, no out-of-scope references
jest.mock("react-native-reanimated", () => {
  const R = require("react");
  return {
    __esModule: true,
    default: {
      View: R.forwardRef((props: any, ref: any) =>
        R.createElement("div", { ...props, ref })
      ),
      createAnimatedComponent: (comp: any) => comp,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: () => ({}),
    withSpring: (val: any) => val,
    withSequence: (val: any) => val,
    withTiming: (val: any) => val,
  };
});

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// Mock safe area
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock lucide icons — factory uses require
jest.mock("lucide-react-native", () => {
  const R = require("react");
  return {
    ArrowLeft: (props: any) => R.createElement("span", { "data-testid": "icon-arrow-left", ...props }),
    Share2: (props: any) => R.createElement("span", { "data-testid": "icon-share", ...props }),
    Heart: (props: any) => R.createElement("span", { "data-testid": "icon-heart", ...props }),
    Bookmark: (props: any) => R.createElement("span", { "data-testid": "icon-bookmark", ...props }),
    Play: (props: any) => R.createElement("span", { "data-testid": "icon-play", ...props }),
    Lock: (props: any) => R.createElement("span", { "data-testid": "icon-lock", ...props }),
    Check: (props: any) => R.createElement("span", { "data-testid": "icon-check", ...props }),
    Star: (props: any) => R.createElement("span", { "data-testid": "icon-star", ...props }),
  };
});

// Mock DramaImage
jest.mock("../../components/DramaImage", () => {
  const R = require("react");
  return {
    DramaImage: ({ uri, alt }: { uri: string; alt: string }) =>
      R.createElement("img", { src: uri, alt, "data-testid": "drama-image" }),
  };
});

// Mock SkeletonBox
jest.mock("../../components/SkeletonBox", () => {
  const R = require("react");
  return {
    __esModule: true,
    default: () => R.createElement("div", { "data-testid": "skeleton-box" }),
  };
});

// Mock StarRating
jest.mock("../../components/StarRating", () => {
  const R = require("react");
  return {
    StarRating: ({ rating, reviewCount }: { rating: number; reviewCount?: string }) =>
      R.createElement(
        "div",
        { "data-testid": "star-rating" },
        R.createElement("span", null, rating),
        reviewCount && R.createElement("span", null, `(${reviewCount} reviews)`)
      ),
  };
});

// Mock FlashList
jest.mock("@shopify/flash-list", () => {
  const R = require("react");
  return {
    FlashList: ({ data, renderItem }: any) =>
      R.createElement(
        "div",
        { "data-testid": "flash-list" },
        data?.map((item: any, index: number) =>
          R.createElement("div", { key: item.id }, renderItem({ item, index }))
        )
      ),
  };
});

// Mock usePlaybackRequest
const mockRequestPlayback = jest.fn();
jest.mock("../../hooks/usePlaybackRequest", () => ({
  usePlaybackRequest: () => mockRequestPlayback,
}));

// Mock analytics
jest.mock("../../lib/analytics-service", () => ({
  analyticsService: { trackEvent: jest.fn() },
}));

// Mock useWatchlist
jest.mock("../../hooks/useWatchlist", () => ({
  useWatchlist: () => ({
    isInWatchlist: jest.fn(() => false),
    toggleWatchlist: jest.fn(),
    isAdding: false,
    isRemoving: false,
  }),
}));

// Mock useAuth
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-token",
    isSubscribed: false,
  }),
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { DramaDetailScreen } from "../../components/DramaDetailScreen";
import type { DramaDetail, Episode } from "../../lib/drama-detail-types";

const makeEpisode = (overrides: Partial<Episode> = {}): Episode => ({
  id: "ep-1",
  number: 1,
  title: "Episode 1",
  image: "https://cdn.test/ep1.jpg",
  duration: "2:05",
  status: "free",
  ...overrides,
});

const makeDetail = (overrides: Partial<DramaDetail> = {}): DramaDetail => ({
  id: "test-drama",
  title: "Test Drama",
  banner: "https://cdn.test/banner.jpg",
  genre: ["romance", "drama"],
  episodeCount: 3,
  year: "2025",
  country: "GH",
  rating: 4.5,
  reviewCount: "1.2K",
  watchingNow: "5.1K",
  likes: "320",
  description: "A captivating drama about love.",
  trailerThumbnail: "https://cdn.test/trailer.jpg",
  trailerDuration: "1:30",
  episodes: [
    makeEpisode({ id: "ep-1", number: 1, title: "Pilot", status: "free" }),
    makeEpisode({ id: "ep-2", number: 2, title: "Second", status: "free" }),
    makeEpisode({ id: "ep-3", number: 3, title: "Third", status: "locked" }),
  ],
  ...overrides,
});

describe("DramaDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Skeleton loading state
  // ---------------------------------------------------------------------------
  it("shows skeleton when isLoading is true", () => {
    render(<DramaDetailScreen dramaId="test-drama" isLoading={true} />);

    const skeletons = screen.getAllByTestId("skeleton-box");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Test Drama")).toBeNull();
  });

  it("shows skeleton when detail is undefined", () => {
    render(
      <DramaDetailScreen dramaId="test-drama" detail={undefined} isLoading={false} />
    );

    const skeletons = screen.getAllByTestId("skeleton-box");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // Title and banner
  // ---------------------------------------------------------------------------
  it("renders drama title when loaded", () => {
    render(<DramaDetailScreen dramaId="test-drama" detail={makeDetail()} />);

    expect(screen.getByText("Test Drama")).toBeTruthy();
  });

  it("renders episode count text", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ episodeCount: 10 })}
      />
    );

    expect(screen.getByText("10 Episodes")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Description section
  // ---------------------------------------------------------------------------
  it("renders About section when description exists", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ description: "A great story" })}
      />
    );

    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("A great story")).toBeTruthy();
  });

  it("hides About section when description is empty", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ description: "" })}
      />
    );

    expect(screen.queryByText("About")).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Rating display
  // ---------------------------------------------------------------------------
  it("shows StarRating when rating is greater than 0", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ rating: 4.5, reviewCount: "1.2K" })}
      />
    );

    expect(screen.getByTestId("star-rating")).toBeTruthy();
  });

  it("hides StarRating when rating is 0 and reviewCount is 0", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ rating: 0, reviewCount: "0" })}
      />
    );

    expect(screen.queryByTestId("star-rating")).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Like button
  // ---------------------------------------------------------------------------
  it("shows Like text when likeCount is 0", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ likes: "0" })}
      />
    );

    expect(screen.getByText("Like")).toBeTruthy();
  });

  it("shows formatted like count when likes > 0", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ likes: "5.1K" })}
      />
    );

    expect(screen.getByText("5.1K")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Episodes section
  // ---------------------------------------------------------------------------
  it("renders episode cards for each episode", () => {
    const detail = makeDetail({
      episodes: [
        makeEpisode({ id: "ep-1", number: 1, title: "Pilot" }),
        makeEpisode({ id: "ep-2", number: 2, title: "Second Episode" }),
      ],
    });

    render(<DramaDetailScreen dramaId="test-drama" detail={detail} />);

    expect(screen.getByText("Pilot")).toBeTruthy();
    expect(screen.getByText("Second Episode")).toBeTruthy();
  });

  it("renders Episodes heading", () => {
    render(<DramaDetailScreen dramaId="test-drama" detail={makeDetail()} />);

    expect(screen.getByText("Episodes")).toBeTruthy();
  });

  it("renders episode count in episodes section", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ episodeCount: 3 })}
      />
    );

    const episodeTexts = screen.getAllByText("3 episodes");
    expect(episodeTexts.length).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // Genre chips
  // ---------------------------------------------------------------------------
  it("renders genre chips from genre array", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ genre: ["romance", "thriller"] })}
      />
    );

    expect(screen.getByText("romance")).toBeTruthy();
    expect(screen.getByText("thriller")).toBeTruthy();
  });

  it("does not render genre chips when genre array is empty", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ genre: [] })}
      />
    );

    expect(screen.queryByText("romance")).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // CTA button
  // ---------------------------------------------------------------------------
  it("renders play CTA button", () => {
    render(<DramaDetailScreen dramaId="test-drama" detail={makeDetail()} />);

    expect(screen.getByTestId("play-cta-btn")).toBeTruthy();
  });

  it("shows 'Start Watching - Episode 1 Free' when drama has free episodes", () => {
    const detail = makeDetail({
      episodes: [
        makeEpisode({ status: "free", number: 1 }),
        makeEpisode({ status: "locked", number: 2 }),
      ],
    });

    render(<DramaDetailScreen dramaId="test-drama" detail={detail} />);

    expect(screen.getByText("Start Watching - Episode 1 Free")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Metadata (year, country)
  // ---------------------------------------------------------------------------
  it("renders year and country metadata", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ year: "2025", country: "GH" })}
      />
    );

    expect(screen.getByText("2025")).toBeTruthy();
    expect(screen.getByText("Ghana")).toBeTruthy();
  });

  it("renders Nigeria for non-GH country", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail({ country: "NG" })}
      />
    );

    expect(screen.getByText("Nigeria")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Watchlist button
  // ---------------------------------------------------------------------------
  it("renders Watchlist button", () => {
    render(<DramaDetailScreen dramaId="test-drama" detail={makeDetail()} />);

    expect(screen.getByText("Watchlist")).toBeTruthy();
    expect(screen.getByTestId("detail-watchlist-btn")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // More Like This
  // ---------------------------------------------------------------------------
  it("renders More Like This section when moreLikeThis has items", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail()}
        moreLikeThis={[
          { id: "rec-1", title: "Similar Drama", image: "https://cdn.test/sim.jpg", genre: "romance" },
        ]}
      />
    );

    expect(screen.getByText("More Like This")).toBeTruthy();
    expect(screen.getByText("Similar Drama")).toBeTruthy();
  });

  it("hides More Like This section when moreLikeThis is empty", () => {
    render(
      <DramaDetailScreen
        dramaId="test-drama"
        detail={makeDetail()}
        moreLikeThis={[]}
      />
    );

    expect(screen.queryByText("More Like This")).toBeNull();
  });
});
