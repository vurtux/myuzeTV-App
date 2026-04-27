import { View, Text, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";

export function ProfilePlaceholder() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      {user?.name && (
        <Text className="text-foreground font-medium mb-2">{user.name}</Text>
      )}
      {user?.email && (
        <Text className="text-muted-foreground text-sm mb-6">{user.email}</Text>
      )}
      <Pressable
        onPress={signOut}
        className="bg-destructive/20 px-6 py-3 rounded-xl active:opacity-80"
      >
        <Text className="text-destructive font-medium">Sign out</Text>
      </Pressable>
    </View>
  );
}
