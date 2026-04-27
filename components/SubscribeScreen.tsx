import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Smartphone,
  Shield,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionPlans } from "../api/subscription";

const benefits = [
  { icon: Check, text: "Watch all episodes" },
  { icon: Sparkles, text: "New episodes every week" },
  { icon: Smartphone, text: "Watch on 3 devices" },
  { icon: Shield, text: "100% ad-free streaming" },
];

interface Plan {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  period: string;
  popular?: boolean;
}

function resolvePlatform(): string {
  const os = Platform.OS;
  if (os === "ios") return "ios";
  if (os === "android") return "android";
  return "web";
}

function formatPlanPrice(plan: Plan): string {
  const price =
    typeof plan.price === "number" ? plan.price.toFixed(2) : plan.price;
  return `${plan.currency ?? ""} ${price}`.trim();
}

function formatPlanPeriod(plan: Plan): string {
  const period = (plan.period ?? "").toLowerCase();
  if (period.includes("month")) return "/month";
  if (period.includes("year") || period.includes("annual")) return "/year";
  if (period.includes("week")) return "/week";
  if (period.includes("day")) return "/day";
  // If it already starts with "/", return as-is
  if (period.startsWith("/")) return period;
  return period ? `/${period}` : "";
}

/**
 * Map raw API plan data to a normalised Plan shape.
 * Handles multiple response formats flexibly.
 */
function mapPlan(raw: Record<string, unknown>): Plan {
  return {
    id: String(raw.id ?? raw.plan_id ?? raw.slug ?? ""),
    name: String(raw.name ?? raw.title ?? raw.label ?? "Plan"),
    price: (raw.price as number | string) ?? 0,
    currency: String(raw.currency ?? raw.currency_code ?? ""),
    period: String(
      raw.period ?? raw.billing_period ?? raw.interval ?? raw.billing_cycle ?? ""
    ),
    popular: Boolean(raw.popular ?? raw.is_popular ?? raw.recommended ?? false),
  };
}

interface SubscribeScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
  episodeId?: string;
}

export function SubscribeScreen({
  onBack,
  onSuccess,
  episodeId,
}: SubscribeScreenProps) {
  const episodeNumber = episodeId ? episodeId.split("-").pop() : null;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const platform = resolvePlatform();

  const {
    data: plans,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Plan[]>({
    queryKey: ["subscription-plans", platform],
    queryFn: async () => {
      const raw = await fetchSubscriptionPlans(platform);
      return raw.map(mapPlan);
    },
  });

  // Auto-select the first popular plan, or the first plan
  const effectiveSelectedPlan =
    selectedPlan ??
    plans?.find((p) => p.popular)?.id ??
    plans?.[0]?.id ??
    null;

  const handleSubscribe = () => {
    if (!effectiveSelectedPlan) return;
    Alert.alert("Coming Soon", "Payment integration is under development.");
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-border/50">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-card border border-border/50 items-center justify-center active:scale-[0.95]"
        >
          <ArrowLeft size={20} color="#71717a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Subscribe</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-4">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
            <Lock size={28} color="#ff4d4d" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center mt-4">
            {episodeNumber
              ? `Unlock Episode ${episodeNumber}`
              : "Unlock All Episodes"}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-2">
            Get unlimited access to premium content
          </Text>
        </View>

        <View className="mt-6 gap-3">
          {benefits.map(({ icon: Icon, text }) => (
            <View key={text} className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                <Icon size={16} color="#ff4d4d" />
              </View>
              <Text className="text-[15px] text-foreground">{text}</Text>
            </View>
          ))}
        </View>

        <View className="mt-8 gap-3">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Choose a plan
          </Text>

          {/* Loading state */}
          {isLoading && (
            <View className="items-center justify-center py-8 gap-3">
              <ActivityIndicator size="large" color="#ff4d4d" />
              <Text className="text-sm text-muted-foreground">
                Loading plans...
              </Text>
            </View>
          )}

          {/* Error state */}
          {isError && (
            <View className="items-center justify-center py-8 gap-3 rounded-2xl border border-border/50 bg-card">
              <AlertCircle size={32} color="#ff4d4d" />
              <Text className="text-sm text-muted-foreground text-center px-4">
                Unable to load plans. Please check your connection and try again.
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-primary/20"
              >
                <RefreshCw size={14} color="#ff4d4d" />
                <Text className="text-sm font-medium text-primary">Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Plans list */}
          {!isLoading &&
            !isError &&
            plans?.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl border-2 p-4 active:scale-[0.98] ${
                  effectiveSelectedPlan === plan.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-semibold text-foreground">
                        {plan.name}
                      </Text>
                      {plan.popular && (
                        <View className="px-2 py-0.5 rounded-full bg-primary/20">
                          <Text className="text-[10px] font-semibold text-primary">
                            BEST VALUE
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted-foreground mt-0.5">
                      {formatPlanPrice(plan)}
                      {formatPlanPeriod(plan)}
                    </Text>
                  </View>
                  {effectiveSelectedPlan === plan.id && (
                    <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                      <Check size={12} color="white" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
        </View>

        <Pressable
          onPress={handleSubscribe}
          disabled={subscribing || isLoading || isError || !effectiveSelectedPlan}
          className={`mt-8 h-12 rounded-xl items-center justify-center active:scale-[0.97] ${
            isLoading || isError || !effectiveSelectedPlan
              ? "bg-primary/50"
              : "bg-primary"
          }`}
        >
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {subscribing && <ActivityIndicator size="small" color="#fff" />}
            <Text className="text-primary-foreground font-semibold text-sm">
              {subscribing ? "Processing..." : "Subscribe Now"}
            </Text>
          </View>
        </Pressable>

        <Text className="text-xs text-muted-foreground text-center mt-4 px-4">
          Charges will be applied to your payment method. Subscription fees are
          non-refundable.
        </Text>
      </ScrollView>
    </View>
  );
}
