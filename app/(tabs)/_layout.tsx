import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { BottomNav, type TabId } from "../../components/BottomNav";

const pathToTab: Record<string, TabId> = {
  "/": "home",
  "/watchlist": "watchlist",
  "/profile": "profile",
};

function TabTransition({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(1);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      opacity.value = withSequence(
        withTiming(0.6, { duration: 60, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 60, easing: Easing.in(Easing.ease) })
      );
    }
  }, [pathname, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default function TabsLayout() {
  const pathname = usePathname();
  const activeTab = pathToTab[pathname] ?? "home";

  return (
    <View className="flex-1 bg-background">
      <TabTransition>
        <Slot />
      </TabTransition>
      <BottomNav activeTab={activeTab} />
    </View>
  );
}
