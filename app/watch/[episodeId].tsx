import { useLocalSearchParams, useRouter } from "expo-router";
import Head from "expo-router/head";
import { View } from "react-native";
import { EpisodeFeed } from "../../components/EpisodeFeed";

export default function WatchScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();

  if (!episodeId) {
    return null;
  }

  // Parse dramaId from episodeId (format: "drama-slug-3" → "drama-slug")
  const parts = episodeId.split("-");
  const lastPart = parts[parts.length - 1];
  const episodeNum = parseInt(lastPart, 10);
  const dramaId = !isNaN(episodeNum) && parts.length >= 2
    ? parts.slice(0, -1).join("-")
    : episodeId;

  return (
    <>
      <Head>
        <title>Watch - myuzeTV</title>
      </Head>
      <View className="flex-1 bg-background">
        <EpisodeFeed
          dramaId={dramaId}
          episodeId={episodeId}
          onClose={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(`/drama/${dramaId}`);
            }
          }}
        />
      </View>
    </>
  );
}
