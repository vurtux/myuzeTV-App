import Head from "expo-router/head";
import { View } from "react-native";
import { ProfileScreen } from "../../components/ProfileScreen";

export default function ProfileTabScreen() {
  return (
    <>
      <Head>
        <title>Profile - myuzeTV</title>
      </Head>
      <View className="flex-1 bg-background">
        <ProfileScreen />
      </View>
    </>
  );
}
