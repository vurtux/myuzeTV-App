import { View, Text } from "react-native";
import { Star } from "lucide-react-native";

const PRIMARY_COLOR = "#f87171";
const MUTED_COLOR = "#bbbbc4";
const TOTAL_STARS = 5;

interface StarRatingProps {
  rating: number;
  reviewCount?: string;
  size?: number;
}

function getStarStates(rating: number): readonly ("full" | "half" | "empty")[] {
  const clamped = Math.max(0, Math.min(TOTAL_STARS, rating));

  return Array.from({ length: TOTAL_STARS }, (_, i) => {
    if (clamped >= i + 1) return "full" as const;
    if (clamped >= i + 0.5) return "half" as const;
    return "empty" as const;
  });
}

function FilledStar({ size }: { size: number }) {
  return <Star size={size} color={PRIMARY_COLOR} fill={PRIMARY_COLOR} />;
}

function EmptyStar({ size }: { size: number }) {
  return <Star size={size} color={MUTED_COLOR} />;
}

function HalfStar({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      {/* Empty star as the base layer */}
      <View style={{ position: "absolute", top: 0, left: 0 }}>
        <EmptyStar size={size} />
      </View>
      {/* Filled star clipped to 50% width */}
      <View style={{ position: "absolute", top: 0, left: 0, width: size / 2, overflow: "hidden" }}>
        <FilledStar size={size} />
      </View>
    </View>
  );
}

export function StarRating({ rating, reviewCount, size = 14 }: StarRatingProps) {
  const stars = getStarStates(rating);
  const displayRating = Math.round(rating * 10) / 10;

  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center" style={{ gap: 2 }}>
        {stars.map((state, index) => {
          const key = `star-${index}`;
          if (state === "full") return <FilledStar key={key} size={size} />;
          if (state === "half") return <HalfStar key={key} size={size} />;
          return <EmptyStar key={key} size={size} />;
        })}
      </View>

      <Text className="text-sm font-semibold text-foreground ml-1">
        {displayRating}
      </Text>

      {reviewCount != null && (
        <Text className="text-sm text-muted-foreground">
          ({reviewCount} reviews)
        </Text>
      )}
    </View>
  );
}
