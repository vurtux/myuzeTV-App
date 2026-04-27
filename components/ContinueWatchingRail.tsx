import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { DramaImage } from "./DramaImage";
import type { Drama } from "../lib/drama-data";

const CARD_WIDTH = 130;
const CARD_GAP = 12;

interface ContinueWatchingRailProps {
  dramas: Drama[];
  onDramaTap?: (id: string) => void;
}

function Card({ drama, onTap }: { drama: Drama; onTap?: () => void }) {
  return (
    <Pressable
      onPress={onTap}
      style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
      className="flex-shrink-0 flex flex-col gap-2 active:scale-[0.97]"
    >
      <View className="relative w-[130px] h-[231px] rounded-md overflow-hidden border border-border/50">
        <DramaImage
          uri={drama.image}
          alt={drama.title}
          width={130}
          height={231}
          contentFit="cover"
          className="w-full h-full object-cover"
        />
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
          <View
            className="h-full bg-primary rounded-r-full"
            style={{ width: `${drama.progress ?? 0}%` }}
          />
        </View>
        <View className="absolute bottom-2 right-2 bg-background/70 px-1.5 py-0.5 rounded-md">
          <Text className="text-[10px] font-semibold text-foreground">
            {drama.progress}%
          </Text>
        </View>
      </View>
      <View className="w-[130px]">
        <Text className="text-xs font-medium text-foreground truncate" numberOfLines={1}>
          {drama.title}
        </Text>
        <Text className="text-[10px] text-muted-foreground">{drama.episode}</Text>
      </View>
    </Pressable>
  );
}

export function ContinueWatchingRail({ dramas, onDramaTap }: ContinueWatchingRailProps) {
  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <View className="flex flex-col gap-3">
      <Text className="text-lg font-semibold text-foreground px-4">
        Continue Watching
      </Text>
      <View style={{ height: 231 + 48 }}>
        <FlashList
          data={dramas}
          renderItem={({ item }) => (
            <Card
              drama={item}
              onTap={() => onDramaTap?.(item.id)}
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
