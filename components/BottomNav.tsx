import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Home, Bookmark, User } from "lucide-react-native";

const tabs = [
  { id: "home" as const, label: "Home", icon: Home, href: "/" },
  { id: "watchlist" as const, label: "Watchlist", icon: Bookmark, href: "/watchlist" },
  { id: "profile" as const, label: "Me", icon: User, href: "/profile" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface BottomNavProps {
  activeTab: TabId;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-8 left-0 right-0 items-center z-50">
      <View className="flex flex-row items-center h-16 px-3 rounded-full border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        {tabs.map(({ id, label, icon: Icon, href }) => {
          const isActive = id === activeTab;
          return (
            <Pressable
              key={id}
              testID={`tab-${id}`}
              onPress={() => router.replace(href as any)}
              className="flex items-center justify-center h-12 w-20 relative active:scale-[0.95] active:opacity-70"
            >
              <View className="items-center justify-center gap-1">
                <Icon
                  size={20}
                  color={isActive ? "white" : "rgba(255,255,255,0.4)"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <Text 
                  className={`text-[10px] tracking-tighter uppercase font-bold ${
                    isActive ? "text-white" : "text-white/40"
                  }`}
                >
                  {label}
                </Text>
              </View>
              {isActive && (
                <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
