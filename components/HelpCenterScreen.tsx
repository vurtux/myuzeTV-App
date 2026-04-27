import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
} from "react-native";
import { ArrowLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react-native";

const FAQS = [
  {
    q: "How do I unlock premium episodes?",
    a: "You can unlock premium episodes by subscribing to myuzeTV Premium. Tap the lock icon on any episode to see subscription options.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Profile > Manage Subscription, or cancel directly through your App Store / Google Play subscription settings. Your access continues until the end of the billing period.",
  },
  {
    q: "Why is a video not loading?",
    a: "Check your internet connection. If the issue persists, try clearing your cache from Profile > Clear Cache, or reinstall the app. Contact support if problems continue.",
  },
  {
    q: "How do I create an account?",
    a: "Tap Log In on the profile page and enter your phone number. You will receive an OTP to verify your identity. No separate sign-up is needed.",
  },
  {
    q: "How do I report a problem with a specific episode?",
    a: "Use the Contact Us option in your profile, or email support@myuze.tv with the drama name, episode number, and a description of the issue.",
  },
];

const CATEGORIES = [
  "Billing & Subscription",
  "Playback Issues",
  "Account Access",
  "Content Request",
  "Bug Report",
  "Other",
];

export function HelpCenterScreen({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!category || !subject.trim() || !description.trim()) return;

    const fullSubject = `[${category}] ${subject.trim()}`;
    const encodedSubject = encodeURIComponent(fullSubject);
    const encodedBody = encodeURIComponent(description.trim());
    const mailtoUrl = `mailto:support@myuze.tv?subject=${encodedSubject}&body=${encodedBody}`;

    Linking.openURL(mailtoUrl).catch(() => {});

    setSubmitted(true);
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setCategory("");
    setSubject("");
    setDescription("");
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center active:scale-[0.95]"
          >
            <ArrowLeft size={20} color="#71717a" />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">Help Center</Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
          <View className="items-center py-10 gap-4">
            <View className="w-14 h-14 rounded-full bg-emerald-500/20 items-center justify-center">
              <CheckCircle2 size={28} color="#10b981" />
            </View>
            <Text className="text-base font-semibold text-foreground">Email Opened</Text>
            <Text className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
              Your email client should have opened with the details pre-filled. Send the email and our support team will get back to you within 24 hours.
            </Text>
            <Pressable onPress={handleSubmitAnother} className="mt-2">
              <Text className="text-sm text-primary font-medium">Send another message</Text>
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
        <Text className="text-lg font-semibold text-foreground">Help Center</Text>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {/* FAQ */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Frequently Asked Questions
        </Text>
        <View className="rounded-2xl bg-card border border-border/50 overflow-hidden mb-6">
          {FAQS.map((faq, i) => (
            <View key={i}>
              <Pressable
                onPress={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex-row items-center justify-between px-4 py-4 active:bg-white/[0.03] active:scale-[0.99]"
              >
                <Text className="text-[15px] text-foreground flex-1 pr-4" numberOfLines={2}>
                  {faq.q}
                </Text>
                <ChevronRight
                  size={16}
                  color="#71717a"
                  style={{ transform: [{ rotate: openFaq === i ? "90deg" : "0deg" }] }}
                />
              </Pressable>
              {openFaq === i && (
                <View className="px-4 pb-4 -mt-1">
                  <Text className="text-sm text-muted-foreground leading-relaxed">{faq.a}</Text>
                </View>
              )}
              {i < FAQS.length - 1 && <View className="h-px bg-border/50 mx-4" />}
            </View>
          ))}
        </View>

        {/* Email Support Form */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Still need help? Email us
        </Text>
        <View className="gap-4">
          <View className="rounded-2xl bg-card border border-border/50 p-4">
            <View className="flex-row items-start gap-3">
              <AlertCircle size={20} color="#ff4d4d" style={{ marginTop: 2 }} />
              <Text className="text-sm text-muted-foreground leading-relaxed flex-1">
                Fill out the form below and your email client will open with the details pre-filled. Our support team typically responds within 24 hours.
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors active:scale-[0.97] active:opacity-80 ${category === cat ? "bg-primary" : "bg-card border border-border/50"}`}
                >
                  <Text className={`text-xs font-medium ${category === cat ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Subject
            </Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief summary of your issue"
              placeholderTextColor="#71717a"
              className="h-12 px-4 rounded-xl bg-card border border-border/50 text-foreground text-[15px]"
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your issue in detail. Include steps to reproduce if reporting a bug..."
              placeholderTextColor="#71717a"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] min-h-[100px]"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!category || !subject.trim() || !description.trim()}
            className={`h-12 rounded-xl items-center justify-center active:scale-[0.97] ${
              category && subject.trim() && description.trim()
                ? "bg-primary"
                : "bg-muted"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                category && subject.trim() && description.trim()
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Open Email
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
