import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft, Check } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_KEY = "@myuzetv/language";

const LANGUAGES = ["English", "French", "Spanish"] as const;
export type Language = (typeof LANGUAGES)[number];

export function LanguageScreen({ onBack, onLanguageChange }: { onBack: () => void; onLanguageChange?: (lang: Language) => void }) {
  const [selected, setSelected] = useState<Language>("English");

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored && LANGUAGES.includes(stored as Language)) {
        setSelected(stored as Language);
      }
    });
  }, []);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
    onLanguageChange?.(lang);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center"
        >
          <ArrowLeft size={20} color="#71717a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Language</Text>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => handleSelect(lang)}
              className="flex-row items-center justify-between px-4 py-4 active:bg-white/[0.03]"
            >
              <Text
                className={`text-[15px] ${selected === lang ? "text-primary font-medium" : "text-foreground"}`}
              >
                {lang}
              </Text>
              {selected === lang && <Check size={20} color="#ff4d4d" />}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
