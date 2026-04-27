/**
 * SingleEpisodePlayer — Plays one episode with controls overlay.
 *
 * Used inside EpisodeFeed's FlatList. No gesture handling for episode navigation
 * (that's handled by FlatList snap scrolling). Handles: play/pause, seek,
 * progress tracking, like, share, episode drawer, skip intro, controls fade.
 */
import { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Share,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Play,
  Pause,
  Share2,
  Heart,
  List,
} from "lucide-react-native";
import { fetchEpisodeStream } from "../api/episodes";
import { analyticsService } from "../lib/analytics-service";
import { useAuth } from "../context/AuthContext";
import type { Episode, DramaDetail } from "../lib/drama-detail-types";
import { EpisodeDrawer } from "./EpisodeDrawer";

/* ─── Constants ─── */
const CONTROLS_TIMEOUT = 4000;
const LOADING_DEBOUNCE = 200;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatCompact(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function parseCompact(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  const u = s.toUpperCase();
  if (u.endsWith("K")) return Math.round(n * 1000);
  if (u.endsWith("M")) return Math.round(n * 1000000);
  return Math.round(n);
}

interface SingleEpisodePlayerProps {
  episode: Episode;
  drama: DramaDetail;
  dramaId: string;
  isActive: boolean;
  isSubscribed: boolean;
  onClose: () => void;
  onFinish: () => void;
  onEpisodeSelect: (ep: Episode) => void;
}

export function SingleEpisodePlayer({
  episode,
  drama,
  dramaId,
  isActive,
  isSubscribed,
  onClose,
  onFinish,
  onEpisodeSelect,
}: SingleEpisodePlayerProps) {
  const videoRef = useRef<Video>(null);
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { width: SCREEN_W } = useWindowDimensions();

  // Playback state
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [showControls, setShowControls] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => parseCompact(drama.likes));
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setLikeCount(parseCompact(drama.likes));
  }, [drama.likes]);

  // Use refs for tracking state — keeps handlePlaybackStatus stable so expo-av
  // never has to re-register its listener during playback (which can drop updates).
  const hasStartedTrackingRef = useRef(false);
  const lastProgressReportedRef = useRef(0);

  // Refs
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stalledTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const playBtnScale = useRef(new Animated.Value(1)).current;
  const userPausedRef = useRef(false);

  // Stable ref for onFinish — prevents handlePlaybackStatus from re-creating
  // every time the parent re-renders (which would force expo-av to re-register the listener).
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Speeds available
  const SPEEDS = [1, 1.5, 2] as const;

  // Episode stream — only fetch when active.
  // Pre-fetching while inactive caused Chrome to create 3 simultaneous <video> elements,
  // which the browser suspends due to resource limits. A suspended video silently ignores
  // play() calls, causing the permanent-spinner bug at EP3+.
  // With enabled:isActive, the URL is fetched once per activation; React Query caches it
  // so swipe-back is instant (within staleTime).
  const effectiveEpisodeId = `${dramaId}-${episode.number}`;
  const { data: streamUrl, isLoading: streamLoading } = useQuery({
    queryKey: ["episode-stream", effectiveEpisodeId],
    queryFn: () => fetchEpisodeStream(effectiveEpisodeId),
    enabled: isActive,
    staleTime: 60 * 1000, // 1 min cache — covers replays without re-fetching
    retry: 2,
  });

  // Play/pause based on isActive
  const needsPlayRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      // Episode became inactive — pause and reset
      userPausedRef.current = false;
      needsPlayRef.current = false;
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(() => {});
      }
      setShowControls(false);
      hasStartedTrackingRef.current = false;
      lastProgressReportedRef.current = 0;
      setShowLoading(true); // Pre-arm spinner for next activation
      return;
    }

    // Episode is active. Show spinner while stream URL is loading.
    setShowLoading(true);

    if (!streamUrl) {
      // Stream URL still fetching — wait for it (effect re-runs when streamUrl resolves)
      needsPlayRef.current = false;
      return;
    }

    // Both active and URL ready — start playback
    userPausedRef.current = false;
    needsPlayRef.current = true;
    if (videoRef.current) {
      videoRef.current.playAsync().catch(() => {
        // Failed (video not ready yet) — will retry in onPlaybackStatusUpdate
      });
    }
  }, [isActive, streamUrl]);

  // Controls fade
  const fadeControlsIn = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [controlsOpacity]);

  const fadeControlsOut = useCallback(() => {
    Animated.timing(controlsOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setShowControls(false);
    });
  }, [controlsOpacity]);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => fadeControlsOut(), CONTROLS_TIMEOUT);
  }, [fadeControlsOut]);

  const showControlsWithTimer = useCallback(() => {
    fadeControlsIn();
    resetHideTimer();
  }, [fadeControlsIn, resetHideTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
    };
  }, []);

  // Controls auto-hide logic
  useEffect(() => {
    if (showControls && status.isLoaded && status.isPlaying) {
      resetHideTimer();
    }
    if (showControls && status.isLoaded && !status.isPlaying) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
  }, [showControls, status.isLoaded, (status as any).isPlaying, resetHideTimer]);


  // Handlers
  const handleTap = useCallback(() => {
    if (showControls) {
      fadeControlsOut();
    } else {
      showControlsWithTimer();
    }
  }, [showControls, fadeControlsOut, showControlsWithTimer]);

  const handleTogglePlay = useCallback(() => {
    if (!status.isLoaded) return;
    // Spring bounce on play button (ByteDance-style: scale 0.8 → 1.2 → 1.0)
    Animated.sequence([
      Animated.timing(playBtnScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(playBtnScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    if (status.isPlaying) {
      needsPlayRef.current = false;
      userPausedRef.current = true;
      videoRef.current?.pauseAsync();
    } else {
      needsPlayRef.current = true;
      userPausedRef.current = false;
      videoRef.current?.playAsync();
    }
    showControlsWithTimer();
  }, [status, showControlsWithTimer, playBtnScale]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    videoRef.current?.setRateAsync(speed, true);
    setShowSpeedPicker(false);
    showControlsWithTimer();
  }, [showControlsWithTimer]);

  // Seekbar scrub — tap or drag on progress bar to seek
  const handleSeekBarPress = useCallback(
    (event: any) => {
      if (!status.isLoaded || !status.durationMillis) return;
      const { locationX } = event.nativeEvent;
      const barWidth = SCREEN_W; // progress bar is full width
      const pct = Math.max(0, Math.min(1, locationX / barWidth));
      const targetMs = Math.round(pct * status.durationMillis);
      videoRef.current?.setPositionAsync(targetMs);
    },
    [status]
  );

  // Track dragging state for seekbar
  const [isSeeking, setIsSeeking] = useState(false);
  const handleSeekBarMove = useCallback(
    (event: any) => {
      if (!status.isLoaded || !status.durationMillis) return;
      setIsSeeking(true);
      const { pageX } = event.nativeEvent;
      const pct = Math.max(0, Math.min(1, pageX / SCREEN_W));
      const targetMs = Math.round(pct * status.durationMillis);
      videoRef.current?.setPositionAsync(targetMs);
    },
    [status]
  );

  const handleSeekBarRelease = useCallback(() => {
    setIsSeeking(false);
  }, []);

  const handleLike = useCallback(() => {
    if (!token) return;
    setLiked((prev) => {
      setLikeCount((c) => !prev ? c + 1 : c - 1);
      analyticsService.trackEvent("episode_liked", {
        drama_id: dramaId,
        episode_number: episode.number,
        liked: !prev,
      });
      return !prev;
    });
  }, [token, dramaId, episode.number]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Watch "${drama.title}" Episode ${episode.number} on myuzeTV!`,
        url: `https://tv.myuze.app/watch/${effectiveEpisodeId}`,
      });
    } catch {}
  }, [drama.title, episode.number, effectiveEpisodeId]);

  // Playback status handler — deps kept minimal so expo-av never has to
  // re-register this listener during active playback. Volatile tracking state
  // is accessed via refs (hasStartedTrackingRef, lastProgressReportedRef, onFinishRef).
  const handlePlaybackStatus = useCallback(
    (newStatus: AVPlaybackStatus) => {
      setStatus(newStatus);
      if (!newStatus.isLoaded) return;

      // Video just became loaded — if we need to play, do it now.
      // This is the Safari iOS fix: playAsync() in useEffect may have fired
      // before the video source was ready. Now that it's loaded, retry.
      if (needsPlayRef.current && !newStatus.isPlaying && !userPausedRef.current) {
        videoRef.current?.playAsync().catch(() => {});
      }

      // Hide loading when playing — unconditional setShowLoading(false) avoids
      // the stale-closure bug where the captured showLoading value is already
      // false while the actual state is still true.
      if (newStatus.isPlaying) {
        setShowLoading(false);
      }

      // Track start (via ref — no re-render, no deps change)
      if (newStatus.isPlaying && !hasStartedTrackingRef.current) {
        analyticsService.trackEvent("playback_started", {
          drama_id: dramaId,
          episode_number: episode.number,
        });
        hasStartedTrackingRef.current = true;
      }

      // Track progress milestones (via ref)
      const pct = Math.floor((newStatus.positionMillis / (newStatus.durationMillis || 1)) * 100);
      const milestone = Math.floor(pct / 25) * 25;
      if (milestone > lastProgressReportedRef.current && milestone <= 100) {
        analyticsService.trackEvent("playback_progress", {
          drama_id: dramaId,
          episode_number: episode.number,
          progress_percent: milestone,
        });
        lastProgressReportedRef.current = milestone;
      }

      // Auto-advance on finish (via ref — stable across parent re-renders)
      if (newStatus.didJustFinish) {
        analyticsService.trackEvent("playback_completed", {
          drama_id: dramaId,
          episode_number: episode.number,
        });
        onFinishRef.current();
      }
    },
    [dramaId, episode.number] // Truly stable — never causes expo-av re-registration
  );

  const isPlaying = status.isLoaded && status.isPlaying;
  const progress = status.isLoaded ? (status.positionMillis / (status.durationMillis || 1)) * 100 : 0;
  const currentTime = status.isLoaded ? formatTime(status.positionMillis) : "0:00";
  const totalTime = status.isLoaded ? formatTime(status.durationMillis || 0) : "0:00";

  return (
    <View style={styles.container}>
      {/* Video */}
      {streamUrl && (
        <Video
          ref={videoRef}
          source={isActive ? { uri: streamUrl } : null}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls={false}
          shouldPlay={false}
          rate={playbackSpeed}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatus}
        />
      )}

      {/* Loading overlay — Pressable so tap triggers play when Safari blocks autoplay.
          Shows "Tap to play" once URL is loaded but video hasn't started (iOS Safari). */}
      {(showLoading || streamLoading) && isActive && (
        <Pressable
          style={styles.loadingOverlay}
          onPress={() => {
            if (videoRef.current && needsPlayRef.current && !userPausedRef.current) {
              videoRef.current.playAsync().catch(() => {});
            }
          }}
        >
          <ActivityIndicator size="large" color="#ff4d4d" />
          {!streamLoading && (
            <Text style={styles.tapToPlayText}>Tap to play</Text>
          )}
        </Pressable>
      )}

      {/* Tap target — show controls when hidden, hide when shown */}
      {!showControls && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => showControlsWithTimer()} />
      )}

      {/* Episode info badge (always visible) */}
      <View style={[styles.epBadgeContainer, { bottom: 34 + insets.bottom }]}>
        <View style={styles.epBadge}>
          <Text style={styles.epBadgeText}>EP {episode.number} / {drama.episodeCount}</Text>
        </View>
      </View>

      {/* Seekable progress bar (always visible) */}
      <Pressable
        onPress={handleSeekBarPress}
        onTouchMove={handleSeekBarMove}
        onTouchEnd={handleSeekBarRelease}
        style={[styles.seekBarTouchTarget, { bottom: insets.bottom }]}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          {/* Scrub handle — visible when seeking or controls shown */}
          {(isSeeking || showControls) && (
            <View style={[styles.scrubHandle, { left: `${progress}%` }]} />
          )}
        </View>
      </Pressable>

      {/* Controls overlay with fade */}
      {showControls && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: controlsOpacity }]}>
          {/* Semi-transparent background — tap to dismiss controls */}
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.3)" }]}
            onPress={fadeControlsOut}
          />
          {/* Top: back button */}
          <View style={[styles.topRow, { paddingTop: insets.top + 4 }]}>
            <Pressable testID="player-back-btn" onPress={onClose} style={({pressed}) => [styles.backBtn, pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }]}>
              <ArrowLeft size={22} color="white" />
            </Pressable>
            <Text style={styles.dramaTitle} numberOfLines={1}>{drama.title}</Text>
          </View>

          {/* Center: play/pause only — seek via progress bar scrub, navigate via swipe */}
          <View style={styles.centerControls}>
            <Animated.View style={{ transform: [{ scale: playBtnScale }] }}>
              <Pressable testID="player-play-btn" onPress={handleTogglePlay} style={styles.playBtn}>
                {isPlaying ? (
                  <Pause size={32} color="white" fill="white" />
                ) : (
                  <Play size={32} color="white" fill="white" style={{ marginLeft: 3 }} />
                )}
              </Pressable>
            </Animated.View>
          </View>

          {/* Right side actions */}
          <View style={[styles.sideActions, { bottom: 100 + insets.bottom }]}>
            <Pressable testID="player-like-btn" onPress={handleLike} style={({pressed}) => [styles.sideBtn, pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }]}>
              <Heart size={26} color={liked ? "#ff4d4d" : "white"} fill={liked ? "#ff4d4d" : "none"} />
              <Text style={styles.sideBtnLabel}>{formatCompact(likeCount)}</Text>
            </Pressable>
            <Pressable testID="player-share-btn" onPress={handleShare} style={({pressed}) => [styles.sideBtn, pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }]}>
              <Share2 size={24} color="white" />
              <Text style={styles.sideBtnLabel}>Share</Text>
            </Pressable>
            <Pressable testID="player-episodes-btn" onPress={() => setShowEpisodes(true)} style={({pressed}) => [styles.sideBtn, pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }]}>
              <List size={24} color="white" />
              <Text style={styles.sideBtnLabel}>Episodes</Text>
            </Pressable>
          </View>

          {/* Bottom: time + speed */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.timeText}>{currentTime}</Text>
            <Pressable testID="speed-btn" onPress={() => setShowSpeedPicker((v) => !v)} style={({pressed}) => [styles.speedBtn, pressed && { opacity: 0.5 }]}>
              <Text style={styles.speedBtnText}>{playbackSpeed}x</Text>
            </Pressable>
            <Text style={styles.timeText}>{totalTime}</Text>
          </View>
        </Animated.View>
      )}

      {/* Speed Picker */}
      {showSpeedPicker && (
        <View style={[styles.speedPicker, { bottom: 70 + insets.bottom }]}>
          {SPEEDS.map((s) => (
            <Pressable
              key={s}
              onPress={() => handleSpeedChange(s)}
              style={[styles.speedOption, s === playbackSpeed && styles.speedOptionActive]}
            >
              <Text style={[styles.speedOptionText, s === playbackSpeed && styles.speedOptionTextActive]}>
                {s}x
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Episode Drawer */}
      {showEpisodes && (
        <EpisodeDrawer
          visible={showEpisodes}
          onClose={() => setShowEpisodes(false)}
          drama={drama}
          currentEpNumber={episode.number}
          isSubscribed={isSubscribed}
          onEpisodeSelect={(ep) => {
            setShowEpisodes(false);
            onEpisodeSelect(ep);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  dramaTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,77,77,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  seekBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
  },
  sideActions: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 20,
    zIndex: 30,
  },
  sideBtn: { alignItems: "center", gap: 4 },
  sideBtnLabel: { color: "white", fontSize: 11, fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  epBadgeContainer: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  epBadge: {
    backgroundColor: "rgba(255,77,77,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  epBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  seekBarTouchTarget: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 30,
    justifyContent: "center",
    zIndex: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "visible",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff4d4d",
    borderRadius: 2,
  },
  scrubHandle: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff4d4d",
    marginLeft: -7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  speedBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  speedBtnText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  speedPicker: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    zIndex: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  speedOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  speedOptionActive: {
    backgroundColor: "rgba(255,77,77,0.3)",
  },
  speedOptionText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  speedOptionTextActive: {
    color: "#ff4d4d",
  },
  tapToPlayText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    letterSpacing: 0.3,
  },
});
