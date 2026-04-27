import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  Shield,
  FileText,
  HelpCircle,
  Mail,
  Star,
  Smartphone,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { HelpCenterScreen } from "./HelpCenterScreen";
import { ContactUsScreen } from "./ContactUsScreen";
// LanguageScreen disconnected — i18n is not implemented yet
// import { LanguageScreen } from "./LanguageScreen";
import { fetchMe, deleteAccount } from "../api/account";
import { signOut as authSignOut } from "../lib/auth-service";
// AsyncStorage import removed — was only used for language preference (i18n not implemented)

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

type SubScreen = "help" | "contact" | null;

type ProfileStats = {
  watchlistCount: number;
  completedDramasCount: number;
  totalWatchHours: number;
};

function MenuItem({
  icon: Icon,
  label,
  value,
  showChevron = true,
  danger = false,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  showChevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between h-16 px-5 active:bg-white/[0.08] active:scale-[0.99]"
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-9 h-9 items-center justify-center rounded-full bg-white/5`}>
          <Icon size={18} color={danger ? "#ef4444" : "white"} strokeWidth={2.2} />
        </View>
        <Text className={`text-[15px] font-bold ${danger ? "text-destructive" : "text-white"}`}>
          {label}
        </Text>
      </View>
      {showChevron && (
        <View className="flex-row items-center gap-2">
          {value && (
            <Text className="text-[13px] font-bold text-white/30 uppercase tracking-tighter">{value}</Text>
          )}
          <ChevronRight size={14} color="rgba(255,255,255,0.2)" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

function formatExpiryDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function ProfileScreen() {
  const { user, token, signOut, isSubscribed, subscriptionExpiresAt, clearAuth } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!token && !!user?.id;
  const insets = useSafeAreaInsets();
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=hidden, 1=first confirm, 2=final confirm
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Stats from API
  const [targetStats, setTargetStats] = useState<ProfileStats>({
    watchlistCount: 0,
    completedDramasCount: 0,
    totalWatchHours: 0,
  });

  // Animated display values
  const [displayWatchlist, setDisplayWatchlist] = useState(0);
  const [displayWatched, setDisplayWatched] = useState(0);
  const [displayWatchTime, setDisplayWatchTime] = useState(0);

  const displayName = isLoggedIn ? (user?.name || "User") : "Guest";
  const displayEmail = isLoggedIn ? (user?.email || user?.phone || "") : "Sign in to unlock all features";

  // Fetch profile stats from API
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await fetchMe();
        if (cancelled) return;

        const watchlistCount = data?.watchlist_count ?? 0;
        const completedDramasCount = data?.completed_dramas_count ?? 0;
        const totalWatchSeconds = data?.total_watch_seconds ?? 0;
        const totalWatchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

        setTargetStats({
          watchlistCount,
          completedDramasCount,
          totalWatchHours,
        });
      } catch (error) {
        // Keep defaults (0) on error
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, []);

  // Animated counter effect
  useEffect(() => {
    const { watchlistCount, completedDramasCount, totalWatchHours } = targetStats;

    // Don't animate if all stats are 0 (initial or failed fetch)
    if (watchlistCount === 0 && completedDramasCount === 0 && totalWatchHours === 0) return;

    const duration = 800;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayWatchlist(Math.round(eased * watchlistCount));
      setDisplayWatched(Math.round(eased * completedDramasCount));
      setDisplayWatchTime(
        Math.round(eased * totalWatchHours * 10) / 10
      );

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [targetStats]);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      await authSignOut();
      clearAuth();
      setDeleteStep(0);
      router.replace("/login");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete account. Please try again.";
      // Error handled below via setDeleteError
      if (Platform.OS === "web") {
        // Show error inline on web since Alert.alert is unreliable
        setDeleteError(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
        setDeleteStep(0);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [clearAuth, router]);

  return (
    <ScrollView className="flex-1 bg-background pb-24" showsVerticalScrollIndicator={false}>
      {/* 1. Header / Avatar Section */}
      <View className="items-center pb-10 px-6" style={{ paddingTop: insets.top + 16 }}>
        <View className="relative shadow-2xl">
          <View className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary/40 p-[3px]">
            <View className="w-full h-full rounded-full bg-black overflow-hidden items-center justify-center">
              {user?.profile_image ? (
                <Image
                  source={{ uri: user.profile_image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-3xl font-black text-white px-1">
                  {getInitials(displayName, displayEmail)}
                </Text>
              )}
            </View>
          </View>
          {isSubscribed && (
            <View className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary items-center justify-center border-[3px] border-background shadow-lg">
              <Sparkles size={14} color="white" />
            </View>
          )}
        </View>
        <Text className="text-display text-white mt-6 text-center">
          {displayName}
        </Text>
        {displayEmail ? (
          <Text className="text-sm font-medium text-muted-foreground/60 tracking-tight mt-1">
            {displayEmail}
          </Text>
        ) : null}
      </View>

      {/* 2. Premium CTA - Glassmorphism */}
      <View className="px-6">
        {isSubscribed ? (
          <View className="rounded-3xl border border-primary/30 bg-primary/10 p-6 overflow-hidden backdrop-blur-3xl shadow-2xl shadow-primary/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary shadow-lg items-center justify-center">
                  <CheckCircle2 size={24} color="white" strokeWidth={3} />
                </View>
                <View>
                  <Text className="text-lg font-black text-white tracking-tight">
                    Premium Member
                  </Text>
                  <Text className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">
                    Pro Status Active
                  </Text>
                </View>
              </View>
            </View>
            <View className="h-px bg-white/10 my-4" />
            <Text className="text-xs font-medium text-white/50">
              {subscriptionExpiresAt
                ? `Your subscription renews on ${formatExpiryDate(subscriptionExpiresAt)}. Enjoy unlimited access.`
                : "Enjoy unlimited access to all content."}
            </Text>
          </View>
        ) : (
          <View className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-3xl shadow-2xl">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
                <Shield size={24} color="white" />
              </View>
              <View>
                <Text className="text-lg font-black text-white tracking-tight">
                  Unlock Premium
                </Text>
                <Text className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">
                  Binge without limits
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/subscribe")}
              className="mt-6 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform"
            >
              <Text className="text-primary-foreground font-black text-[15px] uppercase tracking-tight">
                Upgrade to Premium
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 3. Stats Section - Clean Depth */}
      <View className="px-6 mt-8">
        <View className="flex-row rounded-3xl bg-white/5 border border-white/5 overflow-hidden backdrop-blur-xl">
          <View className="flex-1 items-center py-6 border-r border-white/5">
            <Text className="text-2xl font-black text-white tabular-nums tracking-tighter">
              {displayWatchlist}
            </Text>
            <Text className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5 focus:text-primary">Saved</Text>
          </View>
          <View className="flex-1 items-center py-6 border-r border-white/5">
            <Text className="text-2xl font-black text-white tabular-nums tracking-tighter">
              {displayWatched}
            </Text>
            <Text className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">Seen</Text>
          </View>
          <View className="flex-1 items-center py-6">
            <Text className="text-2xl font-black text-white tabular-nums tracking-tighter">
              {displayWatchTime}h
            </Text>
            <Text className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">Hours</Text>
          </View>
        </View>
      </View>

      {/* 4. Menu Sections */}
      <View className="mt-6">
        <View className="px-4 mb-1">
          <Text className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            Account
          </Text>
        </View>
        <View className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <MenuItem icon={Shield} label="Privacy Policy" onPress={() => router.push("/privacy")} />
          <View className="h-px bg-border/50" />
          <MenuItem icon={FileText} label="Terms of Service" onPress={() => router.push("/terms")} />
        </View>

        <View className="px-4 mt-6 mb-1">
          <Text className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            Support
          </Text>
        </View>
        <View className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <MenuItem icon={HelpCircle} label="Help Center" onPress={() => setActiveSubScreen("help")} />
          <View className="h-px bg-border/50" />
          <MenuItem icon={Mail} label="Contact Us" onPress={() => setActiveSubScreen("contact")} />
          <View className="h-px bg-border/50" />
          <MenuItem
            icon={Star}
            label={Platform.OS === "web" ? "Download app" : "Rate App"}
            onPress={() => {
              if (Platform.OS === "web") {
                Linking.openURL("https://www.myuze.tv").catch(() => {});
              } else {
                // TODO: Open store review when app is published
              }
            }}
          />
        </View>

        <View className="px-4 mt-6 mb-1">
          <Text className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            App
          </Text>
        </View>
        <View className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <MenuItem icon={Smartphone} label="App Version" value={APP_VERSION} showChevron={false} onPress={() => {}} />
        </View>

        <View className="mt-8 mb-4 items-center gap-3 px-4">
          {isLoggedIn ? (
            <>
              <Pressable testID="logout-btn" onPress={() => setLogoutConfirm(true)} className="flex-row items-center gap-2 active:opacity-70">
                <LogOut size={16} color="#ef4444" />
                <Text className="text-destructive font-medium text-[15px]">Log Out</Text>
              </Pressable>
              <Pressable testID="delete-account-btn" onPress={() => { setDeleteError(null); setDeleteStep(1); }} className="active:opacity-70">
                <Text className="text-destructive/60 text-sm">Delete Account</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              testID="login-btn"
              onPress={() => router.push("/login" as any)}
              className="flex-row items-center justify-center gap-2 bg-primary rounded-full px-8 py-3 active:scale-[0.97]"
            >
              <LogOut size={16} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
              <Text className="text-white font-semibold text-[15px]">Log In</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Logout Confirmation */}
      <Modal visible={logoutConfirm} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setLogoutConfirm(false)}
        >
          <Pressable
            className="bg-card border-t border-border rounded-t-3xl p-6 pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-foreground text-center">
              Log out?
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2">
              You can always log back in to access your watchlist and progress.
            </Text>
            <View className="flex-col gap-2.5 mt-5">
              <Pressable
                onPress={async () => {
                  setIsLoggingOut(true);
                  await signOut();
                  setIsLoggingOut(false);
                  setLogoutConfirm(false);
                }}
                disabled={isLoggingOut}
                className="h-12 rounded-full bg-destructive items-center justify-center active:scale-[0.97]"
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-destructive-foreground font-semibold text-sm">
                    Log Out
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="h-12 rounded-full bg-muted items-center justify-center active:scale-[0.97]"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sub-screens: Help, Contact, Language (Privacy/Terms use routes) */}
      <Modal visible={activeSubScreen !== null} animationType="slide" presentationStyle="fullScreen">
        {activeSubScreen === "help" && (
          <HelpCenterScreen onBack={() => setActiveSubScreen(null)} />
        )}
        {activeSubScreen === "contact" && (
          <ContactUsScreen onBack={() => setActiveSubScreen(null)} />
        )}
      </Modal>

      {/* Delete Account - Step 1: Are you sure? */}
      <Modal visible={deleteStep === 1} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setDeleteStep(0)}
        >
          <Pressable
            className="bg-card border-t border-border rounded-t-3xl p-6 pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-destructive text-center">
              Delete Account?
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
              Are you sure you want to delete your account? All your data, watchlist, and viewing history will be permanently removed.
            </Text>
            <View className="flex-col gap-2.5 mt-5">
              <Pressable
                onPress={() => setDeleteStep(2)}
                className="h-12 rounded-full bg-destructive items-center justify-center active:scale-[0.97]"
              >
                <Text className="text-destructive-foreground font-semibold text-sm">
                  Yes, Delete My Account
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setDeleteStep(0)}
                className="h-12 rounded-full bg-muted items-center justify-center active:scale-[0.97]"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Account - Step 2: Final confirmation */}
      <Modal visible={deleteStep === 2} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setDeleteStep(0)}
        >
          <Pressable
            className="bg-card border-t border-border rounded-t-3xl p-6 pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-destructive text-center">
              This action cannot be undone
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
              Your account, watchlist, watch history, and all associated data will be permanently deleted. This cannot be recovered.
            </Text>
            {deleteError && (
              <View className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 mt-3">
                <Text className="text-sm text-destructive text-center">{deleteError}</Text>
              </View>
            )}
            <View className="flex-col gap-2.5 mt-5">
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                className={`h-12 rounded-full bg-destructive items-center justify-center active:scale-[0.97] ${isDeleting ? "opacity-50" : ""}`}
              >
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  {isDeleting && <ActivityIndicator size="small" color="#fff" />}
                  <Text className="text-destructive-foreground font-semibold text-sm">
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => setDeleteStep(0)}
                disabled={isDeleting}
                className="h-12 rounded-full bg-muted items-center justify-center active:scale-[0.97]"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
