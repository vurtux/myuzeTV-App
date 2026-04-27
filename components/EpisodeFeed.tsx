/**
 * EpisodeFeed — FlatList-based vertical episode scroll (ByteDance-style)
 *
 * Replaces PanResponder gesture detection with native FlatList snap scrolling.
 * Each episode is a full-screen item. Swipe up/down scrolls to next/previous
 * with native momentum, snap-to-screen, and ±1 clamping.
 */
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronUp } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { fetchDramaDetail } from "../api/dramas";
import { fetchEpisodeStream } from "../api/episodes";
import type { Episode, DramaDetail } from "../lib/drama-detail-types";
import { SingleEpisodePlayer } from "./SingleEpisodePlayer";

interface EpisodeFeedProps {
  dramaId: string;
  episodeId: string;
  onClose: () => void;
}

function SwipeHint() {
  const translateY = useSharedValue(0);
  const hintOpacity = useSharedValue(1);

  useEffect(() => {
    // Oscillate up/down 3 times then fade out
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      3,
      false,
      () => {
        // After 3 bounces, fade out
        hintOpacity.value = withTiming(0, { duration: 300 });
      }
    );
  }, [translateY, hintOpacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: hintOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 80,
          alignSelf: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <ChevronUp size={24} color="rgba(255,255,255,0.5)" />
      <Text
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        }}
      >
        Swipe up for next
      </Text>
    </Animated.View>
  );
}

export function EpisodeFeed({ dramaId, episodeId, onClose }: EpisodeFeedProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token, isSubscribed, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const scrollCorrectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stable refs for the web scroll listener — avoids stale closures without
  // adding SCREEN_H / episodes.length as effect deps on the listener itself.
  const screenHRef = useRef(SCREEN_H);
  const episodesLengthRef = useRef(0);

  // Parse initial episode number from episodeId (format: "drama-slug-3" or "3")
  const initialEpNumber = parseInt(episodeId.split("-").pop() || "1", 10);

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialEpNumber - 1));
  const [showPaywall, setShowPaywall] = useState(false);

  // Non-logged-in users cannot play — redirect to login
  useEffect(() => {
    if (!token) {
      const watchUrl = `/watch/${episodeId}`;
      router.replace(`/login?redirect=${encodeURIComponent(watchUrl)}` as any);
    }
  }, [token, episodeId, router]);

  // Fetch drama data
  const { data: dramaData, isLoading, isError } = useQuery({
    queryKey: ["drama", dramaId],
    queryFn: () => fetchDramaDetail(dramaId),
    enabled: !!dramaId,
  });

  const episodes = dramaData?.episodes ?? [];

  // Clamp currentIndex when episodes load or change
  useEffect(() => {
    if (episodes.length > 0) {
      setCurrentIndex((prev) => Math.min(prev, episodes.length - 1));
    }
  }, [episodes.length]);

  // Cleanup scroll correction timer
  useEffect(() => {
    return () => {
      if (scrollCorrectionTimerRef.current) clearTimeout(scrollCorrectionTimerRef.current);
    };
  }, []);

  // Scroll to initial episode on load
  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (episodes.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      const targetIndex = Math.min(initialEpNumber - 1, episodes.length - 1);
      if (targetIndex > 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index: targetIndex, animated: false });
        }, 100);
      }
    }
  }, [episodes.length, initialEpNumber]);

  // Enforce lock on swipe — redirect if current episode is locked for non-subscribers
  useEffect(() => {
    if (authLoading || episodes.length === 0 || isSubscribed) return;
    const currentEp = episodes[currentIndex];
    if (currentEp?.status === "locked") {
      const subscribeUrl = `/subscribe?episode=${encodeURIComponent(`${dramaId}-${currentEp.number}`)}`;
      if (!token) {
        router.replace(`/login?redirect=${encodeURIComponent(subscribeUrl)}` as any);
      } else {
        router.replace(subscribeUrl as any);
      }
    }
  }, [currentIndex, episodes, isSubscribed, authLoading, token, router, dramaId]);

  // Viewability config — detect active episode (50% visible for 200ms)
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 200,
        waitForInteraction: false,
      },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
          const newIndex = viewableItems[0].index;
          currentIndexRef.current = newIndex; // sync ref immediately (no render lag)
          setCurrentIndex(newIndex);
        }
      },
    },
  ]).current;

  // Keep a ref in sync with currentIndex to avoid stale closures in scroll handlers
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { screenHRef.current = SCREEN_H; }, [SCREEN_H]);
  useEffect(() => { episodesLengthRef.current = episodes.length; }, [episodes.length]);

  // Prefetch stream URLs for adjacent episodes — warms React Query's cache so
  // when isActive flips the URL is returned synchronously (no API round-trip on swipe).
  // This ONLY prefetches the tiny JSON response (GET /episodes/{id}/stream → HLS URL),
  // NOT the video content itself, so it never creates extra <Video> DOM elements
  // and avoids the Chrome multi-video suspension bug.
  useEffect(() => {
    if (episodes.length === 0) return;
    const toFetch = [currentIndex - 1, currentIndex + 1].filter(
      (i) => i >= 0 && i < episodes.length
    );
    for (const i of toFetch) {
      const epId = `${dramaId}-${episodes[i].number}`;
      queryClient.prefetchQuery({
        queryKey: ["episode-stream", epId],
        queryFn: () => fetchEpisodeStream(epId),
        staleTime: 60 * 1000,
      });
    }
  }, [currentIndex, episodes, dramaId, queryClient]);

  // Web: direct DOM scroll listener — replaces onViewableItemsChanged which has a
  // 200ms minimumViewTime delay and doesn't fire for synthetic events.
  // Reads scrollTop on every animation frame and flips currentIndex immediately,
  // so isActive updates as soon as the snap starts (not 200ms after it settles).
  useEffect(() => {
    if (typeof document === 'undefined' || episodes.length === 0) return;
    const scrollEl = (listRef.current as any)?.getScrollableNode?.() as HTMLElement | null;
    if (!scrollEl) return;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const idx = Math.round(scrollEl.scrollTop / screenHRef.current);
        const clamped = Math.max(0, Math.min(episodesLengthRef.current - 1, idx));
        if (clamped !== currentIndexRef.current) {
          currentIndexRef.current = clamped;
          setCurrentIndex(clamped);
        }
      });
    };
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [episodes.length]);

  // Track where the scroll started so we can clamp relative to it
  const scrollStartIndexRef = useRef(currentIndex);

  const handleScrollBeginDrag = useCallback(() => {
    scrollStartIndexRef.current = currentIndexRef.current;
  }, []);

  // Momentum clamping — prevent skipping >1 episode from scroll START position
  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const intendedIndex = Math.round(offsetY / SCREEN_H);
      const startIdx = scrollStartIndexRef.current;
      // Clamp to at most ±1 from where the drag STARTED (not current)
      const minIndex = Math.max(0, startIdx - 1);
      const maxIndex = Math.min(episodes.length - 1, startIdx + 1);
      const clampedIndex = Math.max(minIndex, Math.min(maxIndex, intendedIndex));

      if (clampedIndex !== intendedIndex && listRef.current) {
        if (scrollCorrectionTimerRef.current) clearTimeout(scrollCorrectionTimerRef.current);
        scrollCorrectionTimerRef.current = setTimeout(() => {
          listRef.current?.scrollToIndex({ index: clampedIndex, animated: true });
        }, 50);
      }
    },
    [episodes.length, SCREEN_H]
  );

  // Auto-advance when episode finishes
  const handleEpisodeFinish = useCallback(
    (episodeIndex: number) => {
      if (episodeIndex < episodes.length - 1) {
        const nextEp = episodes[episodeIndex + 1];
        // Check if next episode is locked for non-subscribers
        if (nextEp?.status === "locked" && !isSubscribed) {
          // Show paywall
          const subscribeUrl = `/subscribe?episode=${encodeURIComponent(`${dramaId}-${nextEp.number}`)}`;
          if (!token) {
            router.push(`/login?redirect=${encodeURIComponent(subscribeUrl)}` as any);
          } else {
            router.push(subscribeUrl as any);
          }
          return;
        }
        // Scroll to next episode
        listRef.current?.scrollToIndex({ index: episodeIndex + 1, animated: true });
      }
    },
    [episodes, isSubscribed, token, router, dramaId]
  );

  // Handle episode change from drawer
  const handleEpisodeSelect = useCallback(
    (ep: Episode) => {
      const targetIndex = episodes.findIndex((e) => e.number === ep.number);
      if (targetIndex >= 0) {
        if (ep.status === "locked" && !isSubscribed) {
          const subscribeUrl = `/subscribe?episode=${encodeURIComponent(`${dramaId}-${ep.number}`)}`;
          if (!token) {
            router.push(`/login?redirect=${encodeURIComponent(subscribeUrl)}` as any);
          } else {
            router.push(subscribeUrl as any);
          }
          return;
        }
        listRef.current?.scrollToIndex({
          index: targetIndex,
          animated: Math.abs(targetIndex - currentIndex) <= 1,
        });
      }
    },
    [episodes, currentIndex, isSubscribed, token, router, dramaId]
  );

  // Render item — only render ±1 of current, empty View for rest
  // Adjacent items get subtle dim + scale-down for parallax depth effect
  const renderItem = useCallback(
    ({ item, index }: { item: Episode; index: number }) => {
      // scrollSnapStop:'always' (web only) forces the browser to pause at every episode
    // even on a fast swipe — mirrors the article's core CSS snap technique.
    const itemStyle: any = {
      width: SCREEN_W,
      height: SCREEN_H,
      backgroundColor: "#000",
      ...(typeof document !== 'undefined' ? { scrollSnapStop: 'always' } : {}),
    };
      if (Math.abs(index - currentIndex) > 1) {
        return <View style={itemStyle} />;
      }

      const isActive = index === currentIndex;
      const adjacentOpacity = isActive ? 1 : 0.85;
      const adjacentScale = isActive ? 1 : 0.97;

      return (
        <View
          style={[
            itemStyle,
            {
              opacity: adjacentOpacity,
              transform: [{ scale: adjacentScale }],
            },
          ]}
        >
          <SingleEpisodePlayer
            episode={item}
            drama={dramaData!}
            dramaId={dramaId}
            isActive={isActive}
            isSubscribed={isSubscribed}
            onClose={onClose}
            onFinish={() => handleEpisodeFinish(index)}
            onEpisodeSelect={handleEpisodeSelect}
          />
        </View>
      );
    },
    [currentIndex, dramaData, dramaId, isSubscribed, onClose, handleEpisodeFinish, handleEpisodeSelect]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_H,
      offset: SCREEN_H * index,
      index,
    }),
    [SCREEN_H]
  );

  // Loading state
  if (isLoading || !dramaData) {
    return (
      <View style={styles.loadingContainer}>
        <Pressable onPress={onClose} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <ArrowLeft size={22} color="white" />
        </Pressable>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading episodes...</Text>
      </View>
    );
  }

  // Error state
  if (isError || episodes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Pressable onPress={onClose} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <ArrowLeft size={22} color="white" />
        </Pressable>
        <Text style={styles.errorText}>Failed to load episodes</Text>
        <Pressable onPress={onClose} style={styles.retryBtn}>
          <Text style={styles.retryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={episodes}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        getItemLayout={getItemLayout}
        // CRITICAL: forces re-render of visible items when currentIndex changes
        // Without this, FlatList won't update isActive prop on already-mounted items
        extraData={currentIndex}
        // Snap scrolling — one full-screen episode per swipe
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        // iOS rubber-band bounce at first/last episode; Android glow suppressed
        bounces={true}
        overScrollMode="never"
        // Performance
        removeClippedSubviews={false}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        // Viewability detection
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        // Momentum clamping
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        // Prevent scroll past last item on iOS Safari
        scrollEventThrottle={16}
        // Hide scrollbar
        showsVerticalScrollIndicator={false}
      />
      {currentIndex === 0 && episodes.length > 1 && <SwipeHint />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // itemContainer styles are now inline (depend on dynamic SCREEN_W/SCREEN_H)
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
