import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

/**
 * Handles playback request with auth and subscription checks:
 * 1. Locked + no token → login → subscribe (with episode context) → play
 * 2. Locked + token → subscribe (with episode context) → play
 * 3. Free + no token → login → play
 * 4. Free + token → play
 */
export function usePlaybackRequest() {
  const router = useRouter();
  const { token, isSubscribed } = useAuth();

  return function requestPlayback(
    dramaId: string,
    episodeIndex: number,
    isLocked: boolean
  ) {
    const episodeId = `${dramaId}-${episodeIndex + 1}`;
    const watchUrl = `/watch/${episodeId}`;
    const subscribeUrl = `/subscribe?episode=${encodeURIComponent(episodeId)}`;

    // Subscribed users can play any episode, even "locked" ones
    if (isLocked && !isSubscribed) {
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(subscribeUrl)}` as any);
      } else {
        router.push(subscribeUrl as any);
      }
      return;
    }

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(watchUrl)}` as any);
      return;
    }

    router.push(watchUrl as any);
  };
}
