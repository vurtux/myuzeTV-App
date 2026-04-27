import { useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { useQuery } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { DramaDetailScreen } from "../../components/DramaDetailScreen";
import { fetchDramaDetail, fetchDramas } from "../../api/dramas";

export default function DramaDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const dramaId = slug ?? "";

  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ["drama", dramaId],
    queryFn: () => fetchDramaDetail(dramaId),
    enabled: dramaId.length > 0,
  });

  const { data: allDramas = [] } = useQuery({
    queryKey: ["dramas"],
    queryFn: fetchDramas,
  });

  const moreLikeThis = filterByGenreOverlap(
    allDramas,
    dramaId,
    detail?.genre ?? []
  );

  if (detailLoading) {
    return (
      <>
        <Head>
          <title>Loading... - myuzeTV</title>
        </Head>
        <DramaDetailScreen dramaId={dramaId} isLoading />
      </>
    );
  }

  if (detailError || !detail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground text-lg font-semibold">
          Failed to load drama
        </Text>
        <Text className="text-muted-foreground mt-2">
          Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Head>
        <title>{detail.title} - myuzeTV</title>
        <meta
          name="description"
          content={`Watch ${detail.title} on myuzeTV. Stream premium short-form dramas.`}
        />
      </Head>
      <DramaDetailScreen
        dramaId={dramaId}
        detail={detail}
        moreLikeThis={moreLikeThis}
      />
    </>
  );
}

/**
 * Filter dramas by genre overlap with the current drama (US-027).
 * Returns dramas sharing at least 1 genre, falling back to all if < 3 matches.
 * Max 10 results.
 */
function filterByGenreOverlap(
  allDramas: any[],
  currentId: string,
  currentGenres: string[]
): any[] {
  const others = allDramas.filter((d: any) => String(d.id) !== currentId);

  if (currentGenres.length === 0) {
    return others.slice(0, 10);
  }

  const lowerGenres = currentGenres.map((g) => g.toLowerCase());

  const genreMatches = others.filter((d: any) => {
    const dramaGenre = d.genre ?? "";
    const dramaGenres = Array.isArray(dramaGenre)
      ? dramaGenre
      : typeof dramaGenre === "string"
        ? dramaGenre.split(",").map((g: string) => g.trim())
        : [];
    return dramaGenres.some((g: string) =>
      lowerGenres.includes(g.toLowerCase())
    );
  });

  if (genreMatches.length >= 3) {
    return genreMatches.slice(0, 10);
  }

  return others.slice(0, 10);
}
