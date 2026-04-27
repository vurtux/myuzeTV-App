import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SubscribeScreen } from "../components/SubscribeScreen";

export default function SubscribeRoute() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const { episode } = useLocalSearchParams<{ episode?: string }>();

  useEffect(() => {
    if (!isLoading && !token) {
      const currentPath = episode
        ? `/subscribe?episode=${encodeURIComponent(episode)}`
        : "/subscribe";
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}` as any);
    }
  }, [token, isLoading, router, episode]);

  if (isLoading || !token) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text className="text-muted-foreground mt-3">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Head>
        <title>Subscribe - myuzeTV</title>
        <meta name="description" content="Subscribe to myuzeTV Premium for unlimited access to short-form dramas." />
      </Head>
      <SubscribeScreen
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
        episodeId={episode || undefined}
        onSuccess={() => {
          if (episode) {
            router.replace(`/watch/${episode}` as any);
          } else {
            router.replace("/profile");
          }
        }}
      />
    </>
  );
}
