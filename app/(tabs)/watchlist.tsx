import { View, Text, ActivityIndicator, FlatList, ListRenderItemInfo } from "react-native";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { Bookmark } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WatchlistCard } from "../../components/WatchlistCard";
import { useWatchlist } from "../../hooks/useWatchlist";
import type { Drama } from "../../lib/drama-data";

function WatchlistGrid({ watchlist, onDramaTap, onRemove }: {
  watchlist: Drama[];
  onDramaTap: (id: string) => void;
  onRemove: (drama: Drama) => void;
}) {
  return (
    <FlatList
      data={watchlist}
      keyExtractor={(item) => item.id}
      renderItem={({ item }: ListRenderItemInfo<Drama>) => (
        <WatchlistCard
          drama={item}
          onPress={() => onDramaTap(item.id)}
          onRemove={() => onRemove(item)}
        />
      )}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 16, paddingBottom: 100 }}
    />
  );
}

export default function WatchlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { watchlist, isLoading, isError, toggleWatchlist } = useWatchlist();

  const handleDramaTap = (id: string) => {
    router.push(`/drama/${id}`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text className="text-muted-foreground mt-3">Loading your watchlist...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-destructive text-center">Failed to load watchlist</Text>
        <Text className="text-muted-foreground text-center mt-2 text-sm">Please try again later</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Head>
        <title>My Watchlist - myuzeTV</title>
      </Head>
      
      {/* Header */}
      <View className="px-4 pb-4 border-b border-border/50" style={{ paddingTop: insets.top + 8 }}>
        <Text className="text-2xl font-bold text-foreground">My Watchlist</Text>
        <Text className="text-sm text-muted-foreground mt-0.5">
          {watchlist.length} {watchlist.length === 1 ? "drama" : "dramas"} saved
        </Text>
      </View>

      {watchlist.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-card border border-border/50 items-center justify-center mb-4">
            <Bookmark size={32} color="#71717a" />
          </View>
          <Text className="text-lg font-semibold text-foreground text-center">Your watchlist is empty</Text>
          <Text className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
            Save dramas you want to watch later and they'll show up here.
          </Text>
        </View>
      ) : (
        <WatchlistGrid
          watchlist={watchlist}
          onDramaTap={handleDramaTap}
          onRemove={toggleWatchlist}
        />
      )}
    </View>
  );
}
