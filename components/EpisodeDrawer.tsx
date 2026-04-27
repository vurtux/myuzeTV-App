/**
 * EpisodeDrawer — Slide-up grid of episodes for selection.
 * Extracted from VideoPlayer for reuse across EpisodeFeed and SingleEpisodePlayer.
 */
import { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Lock, Play as PlayIcon, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Episode, DramaDetail } from "../lib/drama-detail-types";

const COLS = 6;
const RANGE_SIZE = 30;

interface EpisodeDrawerProps {
  visible: boolean;
  onClose: () => void;
  drama: DramaDetail;
  currentEpNumber: number;
  isSubscribed?: boolean;
  onEpisodeSelect: (ep: Episode) => void;
}

export function EpisodeDrawer({
  visible,
  onClose,
  drama,
  currentEpNumber,
  isSubscribed = false,
  onEpisodeSelect,
}: EpisodeDrawerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [activeRange, setActiveRange] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalEps = drama.episodeCount;
  const allEpisodes: Episode[] = Array.from({ length: totalEps }, (_, i) => {
    const existing = drama.episodes[i];
    if (existing) return existing;
    return {
      id: `e${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1}`,
      image: drama.banner,
      duration: "2:30",
      status: "locked" as const,
    };
  });

  const rangeCount = Math.ceil(totalEps / RANGE_SIZE);
  const ranges = Array.from({ length: rangeCount }, (_, i) => {
    const start = i * RANGE_SIZE + 1;
    const end = Math.min((i + 1) * RANGE_SIZE, totalEps);
    return { start, end, label: `${start}-${end}` };
  });

  const visibleEpisodes = allEpisodes.slice(
    activeRange * RANGE_SIZE,
    (activeRange + 1) * RANGE_SIZE
  );

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      slideAnim.setValue(1);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => setIsAnimating(false));
    } else if (!isAnimating) {
      slideAnim.setValue(1);
      backdropAnim.setValue(0);
    }
  }, [visible, isAnimating]);

  const handleClose = useCallback(() => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setIsAnimating(false);
      onClose();
    });
  }, [onClose, slideAnim, backdropAnim]);

  if (!visible && !isAnimating) return null;

  const screenW = Dimensions.get("window").width;
  const GRID_PAD = 12;
  const TILE_GAP = 5;
  const availableW = screenW - GRID_PAD * 2;
  const tileW = Math.floor((availableW - TILE_GAP * (COLS - 1)) / COLS);
  const tileH = Math.round(tileW * 0.7);
  const totalGridW = tileW * COLS + TILE_GAP * (COLS - 1);
  const gridMarginH = Math.floor((screenW - totalGridW) / 2);

  const screenH = Platform.OS === "web" && typeof window !== "undefined"
    ? window.innerHeight
    : Dimensions.get("window").height;
  const drawerMaxH = screenH * 0.72;

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          s.drawer,
          {
            height: drawerMaxH,
            paddingBottom: insets.bottom + 12,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, drawerMaxH],
              }),
            }],
          },
        ]}
      >
        <View style={s.handleWrap}>
          <View style={s.handle} />
        </View>

        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>{drama.title}</Text>
            <Text style={s.headerSubtitle}>{drama.watchingNow} Views</Text>
          </View>
          <Pressable onPress={handleClose} style={({pressed}) => [s.closeBtn, pressed && { transform: [{ scale: 0.9 }] }]}>
            <X size={20} color="white" />
          </Pressable>
        </View>

        <View style={s.tabBar}>
          <Text style={s.tabActive}>Episodes</Text>
        </View>

        {rangeCount > 1 && (
          <View style={s.rangeRow}>
            {ranges.map((r, i) => (
              <Pressable
                key={i}
                onPress={() => setActiveRange(i)}
                style={({pressed}) => [s.rangeChip, i === activeRange && s.rangeChipActive, pressed && { opacity: 0.7 }]}
              >
                <Text style={[s.rangeChipText, i === activeRange && s.rangeChipTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: gridMarginH, paddingBottom: 12 }}
          bounces={false}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: totalGridW }}>
            {visibleEpisodes.map((ep, idx) => {
              const isCurrent = ep.number === currentEpNumber;
              const isLocked = ep.status === "locked" && !isSubscribed;
              const col = idx % COLS;

              return (
                <Pressable
                  key={ep.id}
                  testID={`drawer-ep-${ep.number}`}
                  onPress={() => onEpisodeSelect(ep)}
                  style={({pressed}) => [
                    s.tile,
                    {
                      width: tileW,
                      height: tileH,
                      marginRight: col < COLS - 1 ? TILE_GAP : 0,
                      marginBottom: TILE_GAP,
                    },
                    isCurrent && s.tileActive,
                    pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      s.tileNumber,
                      isCurrent && { color: "#ff4d4d" },
                      isLocked && { color: "rgba(255,255,255,0.35)" },
                    ]}
                  >
                    {ep.number}
                  </Text>
                  {isCurrent && (
                    <View style={s.playingIndicator}>
                      <PlayIcon size={10} color="#ff4d4d" fill="#ff4d4d" />
                    </View>
                  )}
                  {isLocked && (
                    <View style={s.lockBadge}>
                      <Lock size={10} color="rgba(255,255,255,0.5)" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(9,9,11,0.75)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    ...(Platform.OS === "web"
      ? { backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" } as any
      : {}),
  },
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { color: "white", fontSize: 17, fontWeight: "700" },
  headerSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500", marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  tabBar: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.1)" },
  tabActive: { color: "white", fontSize: 15, fontWeight: "700", borderBottomWidth: 2, borderBottomColor: "#ff4d4d", paddingBottom: 8 },
  rangeRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  rangeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)" },
  rangeChipActive: { backgroundColor: "rgba(255,77,77,0.2)", borderWidth: 1, borderColor: "rgba(255,77,77,0.4)" },
  rangeChipText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
  rangeChipTextActive: { color: "#ff4d4d" },
  tile: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tileActive: { backgroundColor: "rgba(255,77,77,0.1)", borderColor: "rgba(255,77,77,0.4)" },
  tileNumber: { color: "white", fontSize: 16, fontWeight: "700" },
  playingIndicator: { position: "absolute", bottom: 4, left: 6 },
  lockBadge: { position: "absolute", top: 4, right: 4 },
});
