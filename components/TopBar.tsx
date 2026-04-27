import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell } from "lucide-react-native";
import { LOGO_IMAGE } from "../lib/drama-data";

interface TopBarProps {
  onSearchOpen: () => void;
}

export function TopBar({ onSearchOpen }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex flex-row items-center justify-between px-6 pb-3 bg-gradient-to-b from-black/80 to-transparent"
      style={{ paddingTop: insets.top + 4 }}
    >
      <Image
        source={LOGO_IMAGE}
        alt="myuzeTV"
        style={{ width: 140, height: 44 }}
        contentFit="contain"
      />
      <View className="flex flex-row items-center gap-2">
        <Pressable
          testID="search-btn"
          onPress={onSearchOpen}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 active:bg-white/10"
        >
          <Search size={20} color="white" strokeWidth={2} />
        </Pressable>
        <View className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5">
          <Bell size={20} color="white" strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}
