import { useState, useEffect, useRef, useMemo } from "react";
import { View, ScrollView, RefreshControl, Text, Animated, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { TopBar } from "../../components/TopBar";
import { HeroUnit } from "../../components/HeroUnit";
import { DramaRail } from "../../components/DramaRail";
import { ContinueWatchingRail } from "../../components/ContinueWatchingRail";
import { GenreChips } from "../../components/GenreChips";
import { SearchOverlay } from "../../components/SearchOverlay";
import { useAuth } from "../../context/AuthContext";
import { fetchDramas, fetchContinueWatching } from "../../api/dramas";
import { fetchRails } from "../../api/rails";

function DynamicBackground({ uri }: { uri?: string }) {
  const [currentUri, setCurrentUri] = useState(uri);
  const [nextUri, setNextUri] = useState<string | undefined>(undefined);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (uri !== currentUri) {
      setNextUri(uri);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setCurrentUri(uri);
        setNextUri(undefined);
        fadeAnim.setValue(0);
      });
    }
  }, [uri, currentUri, fadeAnim]);

  return (
    <View className="absolute inset-0 bg-background">
      {currentUri && (
        <Image
          source={{ uri: currentUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={50}
          className="opacity-40"
        />
      )}
      {nextUri && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }]}>
          <Image
            source={{ uri: nextUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={50}
          />
        </Animated.View>
      )}
      <View className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// US-031: Skeleton loading placeholders
// ---------------------------------------------------------------------------

function SkeletonHero() {
  return (
    <View className="w-full" style={{ height: 450 }}>
      <View className="absolute inset-0 bg-white/10 rounded-none" />
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <View className="w-20 h-5 bg-white/10 rounded-full mb-3" />
        <View className="w-64 h-8 bg-white/10 rounded-md mb-2" />
        <View className="w-48 h-8 bg-white/10 rounded-md mb-4" />
        <View className="flex-row gap-3">
          <View className="flex-1 h-12 bg-white/10 rounded-full" />
          <View className="w-12 h-12 bg-white/10 rounded-full" />
        </View>
      </View>
    </View>
  );
}

function SkeletonRail() {
  return (
    <View className="flex flex-col gap-4">
      <View className="w-40 h-5 bg-white/10 rounded-md mx-6" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} className="flex flex-col gap-2.5" style={{ width: 124 }}>
            <View className="w-full h-[180px] bg-white/10 rounded-md" />
            <View className="w-20 h-3 bg-white/10 rounded-md mx-1" />
            <View className="w-14 h-2.5 bg-white/10 rounded-md mx-1" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Genre filter helper
// ---------------------------------------------------------------------------

const GENRE_MATCH: Record<string, string[]> = {
  romance: ["romance"],
  thriller: ["thriller"],
  fantasy: ["fantasy", "supernatural"],
  comedy: ["comedy"],
  family_drama: ["family", "family drama"],
};

function railMatchesGenre(rail: any, genre: string): boolean {
  if (genre === "all") return true;

  const patterns = GENRE_MATCH[genre] ?? [genre];
  const titleLower = (rail.title ?? "").toLowerCase();

  // Check if the rail title itself suggests the genre
  if (patterns.some((p) => titleLower.includes(p))) return true;

  // Check if any dramas in the rail match the genre
  return (rail.dramas ?? []).some((d: any) => {
    const dramaGenre = (d.genre ?? "").toLowerCase();
    return patterns.some((p) => dramaGenre.includes(p));
  });
}

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("all");

  const {
    data: dramas = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["dramas"],
    queryFn: fetchDramas,
  });

  const {
    data: rails = [],
    isLoading: railsLoading,
    isError: railsError,
  } = useQuery({
    queryKey: ["rails"],
    queryFn: fetchRails,
  });

  // US-029: Continue Watching query — only fetch when authenticated with a real token
  const {
    data: continueWatchingData = [],
  } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: fetchContinueWatching,
    enabled: isAuthenticated && !!token,
  });

  const handleDramaTap = (dramaId: string) => {
    router.push(`/drama/${dramaId}`);
  };

  // US-030: Filter rails by selected genre (client-side)
  const filteredRails = useMemo(
    () => rails.filter((rail: any) => railMatchesGenre(rail, selectedGenre)),
    [rails, selectedGenre],
  );

  const heroDramas = dramas.slice(0, 7);
  const activeHeroDrama = heroDramas[activeHeroIndex];

  return (
    <>
      <Head>
        <title>myuzeTV - Stream Short Dramas</title>
        <meta name="description" content="Stream premium short-form dramas. Binge-worthy stories in bite-sized episodes." />
      </Head>
      <View className="flex-1 bg-background relative">
        <DynamicBackground uri={activeHeroDrama?.image} />
        
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={refetch}
              tintColor="#ff4d4d"
            />
          }
        >
          {isLoading ? (
            /* US-031: Skeleton loading state */
            <View className="gap-6">
              <SkeletonHero />
              <SkeletonRail />
              <SkeletonRail />
              <SkeletonRail />
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center py-20 px-6">
              <Text className="text-destructive text-center">
                {error?.message ?? "Failed to load dramas"}
              </Text>
              <Text className="text-muted-foreground text-center mt-2 text-sm">
                Pull down to retry
              </Text>
            </View>
          ) : (
            <>
              <HeroUnit
                dramas={heroDramas}
                onDramaTap={handleDramaTap}
                onActiveIndexChange={setActiveHeroIndex}
              />

              {/* US-030: Genre chips below hero, above content rails */}
              <View className="py-4">
                <GenreChips
                  selectedGenre={selectedGenre}
                  onSelect={setSelectedGenre}
                />
              </View>

              <View className="gap-6">
                {/* US-029: Continue Watching rail — first rail when available */}
                {isAuthenticated && continueWatchingData.length > 0 && (
                  <ContinueWatchingRail
                    dramas={continueWatchingData}
                    onDramaTap={handleDramaTap}
                  />
                )}

                {filteredRails.map((rail: any) => (
                  <DramaRail
                    key={rail.id}
                    title={rail.title}
                    dramas={rail.dramas}
                    onDramaTap={handleDramaTap}
                  />
                ))}
                {/* Fallback: if no rails match filter, show All Dramas */}
                {filteredRails.length === 0 && (
                  <DramaRail
                    title="All Dramas"
                    dramas={dramas}
                    onDramaTap={handleDramaTap}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Floating TopBar for immersion */}
        <View className="absolute top-0 left-0 right-0 z-50">
          <TopBar onSearchOpen={() => setSearchOpen(true)} />
        </View>

        <SearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          dramas={dramas}
          onDramaTap={handleDramaTap}
        />
      </View>
    </>
  );
}
