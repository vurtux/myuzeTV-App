import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
} from "react-native";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export function ContactUsScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;

    const encodedSubject = encodeURIComponent(subject.trim());
    const encodedBody = encodeURIComponent(message.trim());
    const mailtoUrl = `mailto:support@myuze.tv?subject=${encodedSubject}&body=${encodedBody}`;

    Linking.openURL(mailtoUrl).catch(() => {});

    setSent(true);
  };

  const displayEmail = user?.email || "Not signed in";

  if (sent) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center"
          >
            <ArrowLeft size={20} color="#71717a" />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">Contact Us</Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
          <View className="items-center justify-center py-16 gap-4">
            <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center">
              <CheckCircle2 size={32} color="#10b981" />
            </View>
            <Text className="text-lg font-semibold text-foreground">Message Sent</Text>
            <Text className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
              We typically respond within 24 hours. Check your email for updates.
            </Text>
            <Pressable
              onPress={onBack}
              className="mt-4 px-6 py-2.5 rounded-xl bg-card border border-border/50"
            >
              <Text className="text-foreground text-sm font-medium">Go Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center"
        >
          <ArrowLeft size={20} color="#71717a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Contact Us</Text>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <View className="rounded-2xl bg-card border border-border/50 p-4">
            <View className="flex-row items-center gap-3">
              <Mail size={20} color="#71717a" />
              <View>
                <Text className="text-xs text-muted-foreground">You are writing as</Text>
                <Text className="text-sm text-foreground">{displayEmail}</Text>
              </View>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Subject
            </Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="What can we help with?"
              placeholderTextColor="#71717a"
              className="h-12 px-4 rounded-xl bg-card border border-border/50 text-foreground text-[15px]"
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Message
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or feedback..."
              placeholderTextColor="#71717a"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] min-h-[120px]"
            />
          </View>

          <Pressable
            onPress={handleSend}
            disabled={!subject.trim() || !message.trim()}
            className={`h-12 rounded-xl items-center justify-center ${
              subject.trim() && message.trim() ? "bg-primary" : "bg-muted"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                subject.trim() && message.trim() ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Send Message
            </Text>
          </Pressable>

          <View className="items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <Text className="text-xs text-muted-foreground">Or email us directly</Text>
            <Text className="text-sm text-primary font-medium">support@myuze.tv</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
