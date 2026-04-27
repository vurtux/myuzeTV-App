import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { TERMS_OF_SERVICE_CONTENT } from "../constants/legal";

export function TermsOfServiceScreen({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center"
        >
          <ArrowLeft size={20} color="#71717a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Terms of Service</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-2xl bg-card border border-border/50 p-5">
          <Text className="text-sm text-foreground/90 leading-relaxed">
            {TERMS_OF_SERVICE_CONTENT}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
