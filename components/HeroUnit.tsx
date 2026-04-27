import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, Dimensions, FlatList } from "react-native";
import { DramaImage } from "./DramaImage";
import { Play, Volume2, VolumeOff, RotateCcw } from "lucide-react-native";

import type { Drama } from "../lib/drama-data";
import { isRecent } from "../lib/date-utils";
import { analyticsService } from "../lib/analytics-service";

interface HeroUnitProps {
  dramas?: Drama[];
  onDramaTap?: (id: string) => void;
  onActiveIndexChange?: (index: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth;
const CARD_HEIGHT = Math.min(Math.max(screenHeight * 0.55, 300), 500);

export function HeroUnit({ dramas = [], onDramaTap, onActiveIndexChange }: HeroUnitProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const listRef = useRef<FlatList<Drama>>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number }; layoutMeasurement: { width: number } } }) => {
      isScrollingRef.current = true;
      const { contentOffset } = e.nativeEvent;
      const idx = Math.round(contentOffset.x / screenWidth);
      const clamped = Math.max(0, Math.min(dramas.length - 1, idx));
      if (clamped !== activeIndexRef.current) {
        setActiveIndex(clamped);
      }
    },
    [dramas.length, screenWidth]
  );

  const handleScrollEnd = useCallback(() => {
    isScrollingRef.current = false;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isScrollingRef.current) return;
      setActiveIndex((prev) => {
        const next = dramas.length ? (prev + 1) % dramas.length : 0;
        listRef.current?.scrollToOffset({ offset: next * screenWidth, animated: true });
        return next;
      });
    }, 6500);
    return () => clearInterval(timer);
  }, [dramas.length]);

  const featured = dramas[activeIndex];

  const renderItem = useCallback(
    ({ item, index }: { item: Drama; index: number }) => {
      return (
        <Pressable
          onPress={() => onDramaTap?.(item.id)}
          style={{ width: screenWidth }}
          className="relative overflow-hidden"
        >
          <View style={{ height: CARD_HEIGHT }} className="w-full">
            <DramaImage
              uri={item.image}
              alt={item.title}
              width={screenWidth}
              height={CARD_HEIGHT}
              contentFit="cover"
              contentPosition="top"
              className="absolute inset-0"
            />
            
            {/* Immersive Overlay Gradient */}
            <View className="absolute inset-0 vignette-bottom" />
            <View className="absolute inset-0 bg-black/10" />

            {index === activeIndex && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setIsMuted((m) => !m);
                }}
                className="absolute top-4 right-6 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
              >
                {isMuted ? (
                  <VolumeOff size={16} color="white" />
                ) : (
                  <Volume2 size={16} color="white" />
                )}
              </Pressable>
            )}

            <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="px-2.5 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-sm">
                  <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.genre}
                  </Text>
                </View>
                {isRecent(item.insertedAt) && (
                  <View className="px-2.5 py-1 rounded-full bg-primary/90">
                    <Text className="text-[10px] font-black text-white uppercase italic tracking-wider">
                      NEW
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-3xl font-black text-white leading-tight tracking-tight mb-4" numberOfLines={2}>
                {item.title}
              </Text>

              <View className="flex-row items-center gap-3" style={{ maxWidth: 400 }}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onDramaTap?.(item.id);
                    analyticsService.trackEvent("hero_watch_now_click", {
                      drama_id: item.id,
                      drama_title: item.title
                    });
                  }}
                  className="flex-1 h-12 rounded-full bg-primary items-center justify-center flex-row gap-2 active:scale-[0.97] transition-transform"
                >
                  <Play size={16} color="white" fill="white" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Watch Now</Text>
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    analyticsService.trackEvent("hero_rewind_click", {
                      drama_id: item.id,
                      drama_title: item.title
                    });
                  }}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 items-center justify-center active:scale-[0.95] transition-transform"
                >
                  <RotateCcw size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [activeIndex, isMuted, onDramaTap]
  );

  return (
    <View className="relative">
      <View style={{ height: CARD_HEIGHT }}>
        <FlatList
          ref={listRef}
          data={dramas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          snapToAlignment="start"
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        />
      </View>

      {/* Pagination Dots */}
      <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5 z-20">
        {dramas.map((_, i) => (
          <View
            key={i}
            className={`rounded-full transition-all duration-200 ${
              i === activeIndex ? "bg-primary w-5 h-1" : "bg-white/30 w-1 h-1"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
