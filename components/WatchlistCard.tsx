import { View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { DramaImage } from "./DramaImage";
import type { Drama } from "../lib/drama-data";
import { isRecent } from "../lib/date-utils";

interface WatchlistCardProps {
  drama: Drama;
  onPress: () => void;
  onRemove: () => void;
  isRemoving?: boolean;
}

export function WatchlistCard({ drama, onPress, onRemove, isRemoving }: WatchlistCardProps) {
  return (
    <View className={`flex-1 p-2 ${isRemoving ? "opacity-40" : "opacity-100"}`}>
      <Pressable onPress={onPress} className="active:scale-[0.98] transition-transform rounded-xl">
        <View className="relative w-full rounded-xl overflow-hidden shadow-xl bg-card border border-white/5" style={{ aspectRatio: 2 / 3 }}>
          <DramaImage
            uri={drama.image}
            alt={drama.title}
            width={300}
            height={450}
            contentFit="cover"
            className="w-full h-full"
          />
          
          {isRecent(drama.insertedAt) && (
            <View className="absolute top-2.5 right-12 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-md">
              <Text className="text-[9px] font-black text-white uppercase italic leading-none">NEW</Text>
            </View>
          )}
          
          {/* Glassy Remove button */}
          <View className="absolute top-2.5 right-2.5 z-20">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 items-center justify-center active:scale-95"
            >
              <X size={16} color="white" strokeWidth={3} />
            </Pressable>
          </View>

          {/* Cinematic Overlay */}
          <View className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/30 via-50% to-transparent pointer-events-none" />
          <View className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
             <Text className="text-[15px] font-black text-white leading-tight tracking-tight shadow-md" numberOfLines={2}>
              {drama.title}
            </Text>
            <Text className="text-[10px] font-bold text-primary uppercase mt-1 tracking-widest shadow-sm">
              {drama.genre}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
