import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { DramaImage } from "./DramaImage";
import type { Drama } from "../lib/drama-data";
import { isRecent } from "../lib/date-utils";
import { analyticsService } from "../lib/analytics-service";

const CARD_WIDTH = 124;
const CARD_GAP = 14;

interface DramaRailProps {
  title: string;
  dramas: Drama[];
  variant?: "trending" | "new" | "default";
  onDramaTap?: (id: string, railTitle: string) => void;
}

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Card({
  drama,
  variant = "default",
  onTap,
  railTitle,
}: {
  drama: Drama;
  variant: "trending" | "new" | "default";
  onTap?: (id: string, railTitle: string) => void;
  railTitle: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { 
      damping: 15,
      stiffness: 150,
      mass: 0.6
    });
  };

  return (
    <AnimatedPressable
      onPress={() => {
        onTap?.(drama.id, railTitle);
        analyticsService.trackEvent("drama_card_click", {
          drama_id: drama.id,
          drama_title: drama.title,
          rail_title: railTitle
        });
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: CARD_WIDTH, marginRight: CARD_GAP }, animatedStyle]}
      className="flex-shrink-0 flex flex-col gap-2.5"
    >
      <View className="relative w-full h-[180px] rounded-md overflow-hidden shadow-sm bg-card">
        <DramaImage
          uri={drama.image}
          alt={drama.title}
          width={CARD_WIDTH}
          height={180}
          contentFit="cover"
          className="w-full h-full"
        />
        
        <View className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {variant === "trending" && drama.watching && (
          <View className="absolute top-2 right-2 flex flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/90 backdrop-blur-md">
            <Text className="text-[10px] font-bold text-white tracking-widest leading-none">
              {String(drama.watching)}
            </Text>
          </View>
        )}
        {isRecent(drama.insertedAt) && (
          <View className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-md">
            <Text className="text-[9px] font-black text-white uppercase italic leading-none">NEW</Text>
          </View>
        )}
      </View>
      <View className="px-1">
        <Text className="text-sm font-semibold text-foreground leading-tight" numberOfLines={1}>
          {drama.title}
        </Text>
        <Text className="text-[11px] font-medium text-muted-foreground mt-0.5" numberOfLines={1}>
          {variant === "new" && drama.releasedAgo ? drama.releasedAgo : drama.genre}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

export function DramaRail({
  title,
  dramas,
  variant = "default",
  onDramaTap,
}: DramaRailProps) {
  return (
    <View className="flex flex-col gap-4">
      <Text className="text-xl font-black text-foreground px-6 tracking-tight uppercase">
        {title}
      </Text>
      <View style={{ height: 180 + 56 }}>
        <FlashList
          data={dramas}
          estimatedItemSize={CARD_WIDTH}
          renderItem={({ item }) => (
            <Card
              drama={item}
              variant={variant}
              railTitle={title}
              onTap={(id, rTitle) => onDramaTap?.(id, rTitle)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
        />
      </View>
    </View>
  );
}
