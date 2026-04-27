import { useState, useEffect } from "react";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/** Parse compact number strings like "5.1K" → 5100, "1.2M" → 1200000 */
function parseCompactNumber(s: string): number {
  if (!s) return 0;
  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  const upper = s.toUpperCase();
  if (upper.endsWith("K")) return Math.round(num * 1000);
  if (upper.endsWith("M")) return Math.round(num * 1000000);
  return Math.round(num);
}

/** Format number back to compact: 5100 → "5.1K" */
function formatCompactNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Share,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Play,
  Lock,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DramaImage } from "./DramaImage";
import { StarRating } from "./StarRating";
import SkeletonBox from "./SkeletonBox";
import { usePlaybackRequest } from "../hooks/usePlaybackRequest";
import { analyticsService } from "../lib/analytics-service";
import type { Drama } from "../lib/drama-data";
import type { Episode, DramaDetail } from "../lib/drama-detail-types";

import { useWatchlist } from "../hooks/useWatchlist";
import { useAuth } from "../context/AuthContext";

interface DramaDetailScreenProps {
  dramaId: string;
  detail?: DramaDetail;
  moreLikeThis?: Drama[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WINDOW_HEIGHT = Dimensions.get("window").height;

function computeHeroHeight(): number {
  return Math.min(Math.max(WINDOW_HEIGHT * 0.55, 300), 500);
}

/**
 * Parse genre into an array of strings regardless of input format.
 */
function parseGenres(genre: string | string[] | undefined): string[] {
  if (!genre) return [];
  if (Array.isArray(genre)) return genre;
  return genre
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

/**
 * Determine CTA text based on episode state.
 */
function getCTAText(episodes: Episode[], isSubscribed: boolean): string {
  if (episodes.length === 0) return isSubscribed ? "Start Watching" : "Subscribe to Watch";

  // Check for watch progress (find last watched episode)
  const lastWatchedIndex = episodes.reduce((acc, ep, idx) => {
    if (ep.status === "watched" || (ep.progress && ep.progress > 0)) {
      return idx;
    }
    return acc;
  }, -1);

  if (lastWatchedIndex >= 0 && lastWatchedIndex < episodes.length - 1) {
    const nextEp = episodes[lastWatchedIndex + 1];
    return `Continue Watching - Episode ${nextEp.number}`;
  }

  // Subscribed users don't need "Free" marker
  if (isSubscribed) {
    return "Start Watching";
  }

  // Check if drama has free episodes
  const hasFreeEpisodes = episodes.some((ep) => ep.status === "free");
  if (hasFreeEpisodes) {
    return "Start Watching - Episode 1 Free";
  }

  return isSubscribed ? "Start Watching" : "Subscribe to Watch";
}

/**
 * Determine the episode index and lock state for the CTA action.
 */
function getCTATarget(episodes: Episode[]): {
  episodeIndex: number;
  isLocked: boolean;
} {
  if (episodes.length === 0) return { episodeIndex: 0, isLocked: true };

  const lastWatchedIndex = episodes.reduce((acc, ep, idx) => {
    if (ep.status === "watched" || (ep.progress && ep.progress > 0)) {
      return idx;
    }
    return acc;
  }, -1);

  if (lastWatchedIndex >= 0 && lastWatchedIndex < episodes.length - 1) {
    const nextEp = episodes[lastWatchedIndex + 1];
    return {
      episodeIndex: nextEp.number - 1,
      isLocked: nextEp.status === "locked",
    };
  }

  const firstEp = episodes[0];
  return {
    episodeIndex: 0,
    isLocked: firstEp.status === "locked",
  };
}

// ---------------------------------------------------------------------------
// Skeleton Loading (US-208)
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  const heroHeight = computeHeroHeight();
  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero skeleton */}
      <SkeletonBox width={screenWidth} height={heroHeight} borderRadius={0} />

      {/* Action bar skeleton */}
      <View className="flex-row gap-3 px-6 mt-4">
        <SkeletonBox width="48%" height={56} borderRadius={9999} />
        <SkeletonBox width="48%" height={56} borderRadius={9999} />
      </View>

      {/* Genre chips skeleton */}
      <View className="flex-row gap-2 px-6 pt-6">
        <SkeletonBox width={72} height={28} borderRadius={9999} />
        <SkeletonBox width={88} height={28} borderRadius={9999} />
        <SkeletonBox width={64} height={28} borderRadius={9999} />
      </View>

      {/* Rating skeleton */}
      <View className="px-6 pt-4">
        <SkeletonBox width={200} height={20} borderRadius={4} />
      </View>

      {/* Metadata skeleton */}
      <View className="flex-row gap-4 px-6 pt-4">
        <SkeletonBox width={48} height={16} borderRadius={4} />
        <SkeletonBox width={64} height={16} borderRadius={4} />
        <SkeletonBox width={80} height={16} borderRadius={4} />
      </View>

      {/* CTA skeleton */}
      <View className="px-6 pt-8">
        <SkeletonBox width="100%" height={64} borderRadius={9999} />
      </View>

      {/* About skeleton */}
      <View className="gap-2 px-4 pt-6">
        <SkeletonBox width={80} height={22} borderRadius={4} />
        <SkeletonBox width="100%" height={16} borderRadius={4} />
        <SkeletonBox width="100%" height={16} borderRadius={4} />
        <SkeletonBox width="60%" height={16} borderRadius={4} />
      </View>

      {/* Episodes skeleton */}
      <View className="gap-3 px-4 pt-6">
        <SkeletonBox width={100} height={22} borderRadius={4} />
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-[47%]">
              <SkeletonBox
                width="100%"
                height={200}
                borderRadius={6}
              />
              <SkeletonBox
                width="70%"
                height={14}
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Episode Card
// ---------------------------------------------------------------------------

function EpisodeCard({
  episode,
  onTap,
  isSubscribed = false,
}: {
  episode: Episode;
  onTap: () => void;
  isSubscribed?: boolean;
}) {
  // Subscribed users see all episodes as unlocked
  const isLocked = episode.status === "locked" && !isSubscribed;
  const isWatched = episode.status === "watched";

  return (
    <Pressable testID={`episode-${episode.number}`} onPress={onTap} className="flex-col gap-1.5 active:scale-[0.97]">
      <View
        className="relative rounded-md overflow-hidden border border-border/50"
        style={{ aspectRatio: 3 / 4 }}
      >
        <DramaImage
          uri={episode.image}
          alt={episode.title}
          width={180}
          height={240}
          contentFit="cover"
          className={`w-full h-full ${isLocked ? "opacity-50" : ""}`}
        />
        {isLocked && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <View className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 items-center justify-center">
              <Lock size={20} color="#f87171" />
            </View>
            <Text className="text-xs font-semibold text-primary mt-1.5">
              Premium
            </Text>
          </View>
        )}
        {isWatched && (
          <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 items-center justify-center shadow-sm">
            <Check size={14} color="white" strokeWidth={3} />
          </View>
        )}
        {episode.status === "free" && (
          <>
            <View className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500/90 shadow-sm">
              <Text className="text-[10px] font-black text-white uppercase leading-none">
                FREE
              </Text>
            </View>
            <View className="absolute bottom-2 left-2 right-2 flex-row justify-between items-end">
              <View className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
                <Text className="text-[10px] font-bold text-white/90">
                  Ep {episode.number}
                </Text>
              </View>
              <View className="bg-black/80 backdrop-blur-xl px-1.5 py-0.5 rounded-full border border-white/20">
                <Text className="text-[10px] font-black text-rose-400 tracking-tight">
                  {episode.duration}
                </Text>
              </View>
            </View>
          </>
        )}
        {isLocked && (
          <Text className="absolute bottom-2 left-2 text-[11px] font-semibold text-foreground/70 bg-black/30 px-1.5 py-0.5 rounded">
            Ep {episode.number}
          </Text>
        )}
      </View>
      <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
        {episode.title}
      </Text>
      {isWatched && episode.watchedAgo && (
        <Text className="text-[10px] text-muted-foreground">
          Watched {episode.watchedAgo}
        </Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Genre Chips (US-024)
// ---------------------------------------------------------------------------

function GenreChips({ genres }: { genres: string[] }) {
  const parsed = parseGenres(genres);
  if (parsed.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {parsed.map((genre) => (
        <View
          key={genre}
          className="bg-primary/20 border border-primary/30 rounded-full px-2.5 py-1"
        >
          <Text className="text-[11px] font-bold text-primary uppercase tracking-wider">
            {genre}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DramaDetailScreen({
  dramaId,
  detail,
  moreLikeThis = [],
  isLoading = false,
}: DramaDetailScreenProps) {
  const { isSubscribed } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const requestPlayback = usePlaybackRequest();
  const { isInWatchlist, toggleWatchlist, isAdding, isRemoving } =
    useWatchlist();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => {
    if (detail?.likes) {
      const parsed = parseCompactNumber(detail.likes);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  });
  const [expanded, setExpanded] = useState(false);

  // Like button spring pop animation (reuses DramaRail spring pattern)
  const likeScale = useSharedValue(1);
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  useEffect(() => {
    if (detail?.likes) {
      const parsed = parseCompactNumber(detail.likes);
      if (!isNaN(parsed)) setLikeCount(parsed);
    }
  }, [detail?.likes]);

  // US-208: Show skeleton while loading
  if (isLoading || !detail) {
    return <DetailSkeleton />;
  }

  const heroHeight = computeHeroHeight();
  const genres = parseGenres(detail.genre);
  const ctaText = getCTAText(detail.episodes, isSubscribed);
  const ctaTarget = getCTATarget(detail.episodes);

  const handlePlay = (episodeIndex: number, isLocked: boolean) => {
    requestPlayback(dramaId, episodeIndex, isLocked);
    analyticsService.trackEvent("drama_detail_play_click", {
      drama_id: dramaId,
      drama_title: detail.title,
      episode_index: episodeIndex,
      is_locked: isLocked,
    });
  };

  const handleEpisodeTap = (ep: Episode) => {
    const isLocked = ep.status === "locked" && !isSubscribed;
    handlePlay(ep.number - 1, isLocked);
    analyticsService.trackEvent("drama_detail_episode_click", {
      drama_id: dramaId,
      drama_title: detail.title,
      episode_id: ep.id,
      episode_number: ep.number,
      is_locked: isLocked,
    });
  };

  const handleNavigate = (id: string) => {
    router.replace(`/drama/${id}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 96 }}
    >
      {/* Hero Banner Section (US-023) */}
      <View className="relative w-full" style={{ height: heroHeight }}>
        <DramaImage
          uri={detail.banner}
          alt={detail.title}
          width={Dimensions.get("window").width}
          height={heroHeight}
          contentFit="cover"
          className="absolute inset-0"
        />
        {/* 4-stop gradient (US-023) */}
        <View className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 via-transparent to-background" />

        {/* Navigation Actions */}
        <View
          className="absolute left-0 right-0 px-6 flex-row justify-between z-20"
          style={{ top: insets.top + 4 }}
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="w-11 h-11 rounded-full bg-black/60 border border-white/10 items-center justify-center active:scale-95"
          >
            <ArrowLeft size={22} color="white" strokeWidth={2.5} />
          </Pressable>
          <Pressable
            onPress={() => {
              Share.share({
                message: `Check out ${detail?.title ?? "this drama"} on myuzeTV`,
                url: `https://tv.myuze.app/drama/${detail?.slug ?? dramaId}`,
              }).catch(() => {});
            }}
            className="w-11 h-11 rounded-full bg-black/60 border border-white/10 items-center justify-center active:scale-95"
          >
            <Share2 size={20} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* US-025: Hero play button REMOVED */}

        {/* Hero Meta — title + episode count only, no description here */}
        <View className="absolute bottom-0 inset-x-0 px-6 pb-6">
          <Text className="text-white/60 text-xs font-bold uppercase tracking-tighter mb-2">
            {detail.episodeCount} Episodes
          </Text>
          <Text className="text-display text-white leading-none mb-1">
            {detail.title}
          </Text>
        </View>
      </View>

      {/* Action Bar - Premium Glass */}
      <View className="flex-row gap-3 px-6 -mt-3 z-30">
        <Pressable
          testID="detail-like-btn"
          onPress={() => {
            const newLiked = !liked;
            setLiked(newLiked);
            setLikeCount((c) => newLiked ? c + 1 : c - 1);
            // Spring pop on like toggle
            likeScale.value = withSequence(
              withTiming(newLiked ? 1.3 : 0.8, { duration: 80 }),
              withSpring(1, { damping: 12, stiffness: 200, mass: 0.6 })
            );
            analyticsService.trackEvent("drama_detail_like_click", {
              drama_id: dramaId,
              drama_title: detail.title,
              liked: newLiked,
            });
          }}
          className={`flex-1 flex-row items-center justify-center gap-2.5 h-14 rounded-full border backdrop-blur-2xl ${
            liked
              ? "bg-primary/20 border-primary"
              : "bg-black/40 border-white/10"
          }`}
        >
          <Reanimated.View style={likeAnimatedStyle}>
            <Heart
              size={18}
              color={liked ? "#ff4d4d" : "white"}
              fill={liked ? "#ff4d4d" : "none"}
              strokeWidth={2}
            />
          </Reanimated.View>
          <Text
            className={`text-[13px] font-black uppercase tracking-tight ${
              liked ? "text-primary" : "text-white"
            }`}
          >
            {likeCount > 0 ? formatCompactNumber(likeCount) : "Like"}
          </Text>
        </Pressable>
        <Pressable
          testID="detail-watchlist-btn"
          onPress={() => {
            toggleWatchlist({
              id: dramaId,
              title: detail.title,
              image: detail.banner,
              genre: genres[0] || "",
            });
            analyticsService.trackEvent("drama_detail_watchlist_click", {
              drama_id: dramaId,
              drama_title: detail.title,
              in_watchlist: !isInWatchlist(dramaId),
            });
          }}
          disabled={isAdding || isRemoving}
          className={`flex-1 flex-row items-center justify-center gap-2.5 h-14 rounded-full border backdrop-blur-2xl ${
            isInWatchlist(dramaId)
              ? "bg-primary/20 border-primary"
              : "bg-black/40 border-white/10"
          }`}
        >
          {isAdding || isRemoving ? (
            <ActivityIndicator size="small" color="#ff4d4d" />
          ) : (
            <Bookmark
              size={18}
              color={isInWatchlist(dramaId) ? "#ff4d4d" : "white"}
              fill={isInWatchlist(dramaId) ? "#ff4d4d" : "none"}
              strokeWidth={2}
            />
          )}
          <Text
            className={`text-[13px] font-black uppercase tracking-tight ${
              isInWatchlist(dramaId) ? "text-primary" : "text-white"
            }`}
          >
            Watchlist
          </Text>
        </Pressable>
      </View>

      {/* Genre Chips + Rating + Metadata (US-024) */}
      <View className="gap-4 px-6 pt-8">
        {/* All genre chips */}
        <GenreChips genres={genres} />

        {/* Star rating (US-024) — hidden when no ratings exist */}
        {(detail.rating > 0 || detail.reviewCount !== "0") && (
          <StarRating
            rating={detail.rating}
            reviewCount={detail.reviewCount}
            size={14}
          />
        )}

        {/* Year / Country metadata */}
        <View className="flex-row items-center gap-4 border-t border-white/5 pt-4">
          <Text className="text-white font-bold text-xs">{detail.year}</Text>
          <View className="w-1 h-1 rounded-full bg-white/10" />
          <Text className="text-white font-bold text-xs">
            {detail.country === "GH" ? "Ghana" : "Nigeria"}
          </Text>
          <View className="w-1 h-1 rounded-full bg-white/10" />
          <Text className="text-muted-foreground text-xs">
            {detail.episodeCount} episodes
          </Text>
        </View>
      </View>

      {/* CTA Button (US-025) */}
      <View className="px-6 pt-8">
        <Pressable
          testID="play-cta-btn"
          onPress={() =>
            handlePlay(ctaTarget.episodeIndex, ctaTarget.isLocked && !isSubscribed)
          }
          className="flex-row items-center justify-center gap-3 h-16 rounded-full bg-primary shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
            <Play size={16} color="white" fill="white" />
          </View>
          <Text className="text-base font-black text-primary-foreground tracking-tight">
            {ctaText}
          </Text>
        </Pressable>
      </View>

      {/* About — single description location (US-205/023) */}
      {detail.description ? (
        <View className="gap-2 px-4 pt-6">
          <Text className="text-lg font-semibold text-foreground">About</Text>
          <Text
            className="text-sm text-muted-foreground leading-relaxed"
            numberOfLines={expanded ? undefined : 3}
          >
            {detail.description}
          </Text>
          <Pressable onPress={() => setExpanded((prev) => !prev)} className="active:opacity-70">
            <Text className="text-sm font-medium text-primary">
              {expanded ? "Show less" : "Read more"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Episodes — ALL episodes, no "+N more" (US-026) */}
      <View className="gap-3 px-4 pt-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-foreground">
            Episodes
          </Text>
          <Text className="text-sm text-muted-foreground">
            {detail.episodeCount} episodes
          </Text>
        </View>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {detail.episodes.map((ep) => (
            <View key={ep.id} className="w-[47%]">
              <EpisodeCard
                episode={ep}
                onTap={() => handleEpisodeTap(ep)}
                isSubscribed={isSubscribed}
              />
            </View>
          ))}
        </View>
      </View>

      {/* More Like This (US-027 — filtered by genre in route handler) */}
      {moreLikeThis.length > 0 && (
        <View className="gap-3 pt-8">
          <Text className="text-lg font-semibold text-foreground px-4">
            More Like This
          </Text>
          <View style={{ height: 196 + 48 }}>
            <FlashList
              data={moreLikeThis}
              estimatedItemSize={110}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleNavigate(item.id)}
                  style={{ width: 110, marginRight: 12 }}
                  className="w-[110px] active:scale-[0.97]"
                >
                  <View className="w-[110px] h-[196px] rounded-md overflow-hidden border border-border/50">
                    <DramaImage
                      uri={item.image}
                      alt={item.title}
                      width={110}
                      height={196}
                      contentFit="cover"
                      className="w-full h-full"
                    />
                  </View>
                  <Text
                    className="text-xs font-medium text-foreground mt-2"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-[10px] text-muted-foreground"
                    numberOfLines={1}
                  >
                    {item.genre}
                  </Text>
                </Pressable>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
