import { Slot, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text, Pressable } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { analyticsService } from "../lib/analytics-service";
import { SplashTransition } from "../components/SplashTransition";
import "../global.css";

const queryClient = new QueryClient();

/** Class-based error boundary (React does not support error boundaries with hooks). */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Text className="text-foreground text-xl font-bold text-center mb-3">
            Something went wrong
          </Text>
          <Text className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
            An unexpected error occurred. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-primary px-8 py-3 rounded-full active:scale-[0.97]"
          >
            <Text className="text-primary-foreground font-semibold text-sm">
              Retry
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const PUBLIC_PATHS = new Set(["/login", "/privacy", "/terms"]);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Track screen views automatically
    if (!isLoading) {
      analyticsService.screenView(pathname);
    }
  }, [pathname, isLoading]);

  // Don't redirect while splash is showing (auth still loading)
  useEffect(() => {
    if (isLoading || showSplash) return;
    if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
      const redirect = pathname ? encodeURIComponent(pathname) : "";
      router.replace(redirect ? `/login?redirect=${redirect}` : "/login");
    }
  }, [isAuthenticated, isLoading, pathname, showSplash]);

  return (
    <>
      {/* Always render children so content is ready under splash */}
      {(!isLoading || !showSplash) && (isAuthenticated || PUBLIC_PATHS.has(pathname)) ? children : (
        <View className="flex-1 bg-background" />
      )}
      {showSplash && (
        <SplashTransition
          isReady={!isLoading}
          onComplete={() => setShowSplash(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <AuthGate>
            <ErrorBoundary>
              <Slot />
            </ErrorBoundary>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
