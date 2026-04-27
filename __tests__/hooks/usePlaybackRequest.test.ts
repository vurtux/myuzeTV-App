// Mock expo-router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock AuthContext
let mockAuthState = { token: null as string | null, isSubscribed: false };
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

import { renderHook } from "@testing-library/react";
import { usePlaybackRequest } from "../../hooks/usePlaybackRequest";

describe("usePlaybackRequest", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockAuthState = { token: null, isSubscribed: false };
  });

  // ---------------------------------------------------------------------------
  // Free episode + no token → login → play
  // ---------------------------------------------------------------------------
  it("redirects to login with watch redirect for free episode when not logged in", () => {
    mockAuthState = { token: null, isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("love-in-accra", 0, false);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain("/login");
    expect(url).toContain(encodeURIComponent("/watch/love-in-accra-1"));
  });

  // ---------------------------------------------------------------------------
  // Free episode + token → play directly
  // ---------------------------------------------------------------------------
  it("navigates directly to watch page for free episode when logged in", () => {
    mockAuthState = { token: "user-token", isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("love-in-accra", 0, false);

    expect(mockPush).toHaveBeenCalledWith("/watch/love-in-accra-1");
  });

  // ---------------------------------------------------------------------------
  // Locked episode + no token → login → subscribe
  // ---------------------------------------------------------------------------
  it("redirects to login with subscribe redirect for locked episode when not logged in", () => {
    mockAuthState = { token: null, isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("love-in-accra", 2, true);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain("/login");
    expect(url).toContain(encodeURIComponent("/subscribe"));
    expect(url).toContain(encodeURIComponent("episode=love-in-accra-3"));
  });

  // ---------------------------------------------------------------------------
  // Locked episode + token + not subscribed → subscribe
  // ---------------------------------------------------------------------------
  it("redirects to subscribe page for locked episode when logged in but not subscribed", () => {
    mockAuthState = { token: "user-token", isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("ceo-secret", 4, true);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain("/subscribe");
    expect(url).toContain("episode=");
    expect(url).toContain("ceo-secret-5");
  });

  // ---------------------------------------------------------------------------
  // Locked episode + subscribed → play directly (bypasses lock)
  // ---------------------------------------------------------------------------
  it("navigates directly to watch page for locked episode when subscribed", () => {
    mockAuthState = { token: "user-token", isSubscribed: true };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("love-in-accra", 2, true);

    // isSubscribed overrides isLocked, so it goes straight to watch
    expect(mockPush).toHaveBeenCalledWith("/watch/love-in-accra-3");
  });

  // ---------------------------------------------------------------------------
  // Episode ID construction
  // ---------------------------------------------------------------------------
  it("constructs episodeId as {dramaId}-{episodeIndex+1}", () => {
    mockAuthState = { token: "user-token", isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("gold-coast", 0, false);

    expect(mockPush).toHaveBeenCalledWith("/watch/gold-coast-1");
  });

  it("constructs correct episodeId for higher episode index", () => {
    mockAuthState = { token: "user-token", isSubscribed: false };

    const { result } = renderHook(() => usePlaybackRequest());
    result.current("drama-x", 9, false);

    expect(mockPush).toHaveBeenCalledWith("/watch/drama-x-10");
  });
});
