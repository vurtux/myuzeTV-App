/**
 * LoadingButton — Button with idle/loading/success states.
 *
 * Replaces the inconsistent loading patterns across the app:
 * - Login buttons: had spinners (good)
 * - Subscribe/Delete: had text change only (mediocre)
 * - Watchlist/Logout: had nothing (bad)
 *
 * States:
 *   idle    → shows children (normal button)
 *   loading → shows ActivityIndicator + optional loadingText, button disabled
 *   success → shows checkmark with spring scale, auto-resets after delay
 */
import { useEffect, useRef } from "react";
import {
  Pressable,
  ActivityIndicator,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";

type ButtonState = "idle" | "loading" | "success";

interface LoadingButtonProps extends Omit<PressableProps, "style"> {
  state?: ButtonState;
  loadingText?: string;
  spinnerColor?: string;
  spinnerSize?: "small" | "large";
  style?: ViewStyle;
  textStyle?: TextStyle;
  successDuration?: number;
  onSuccessEnd?: () => void;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LoadingButton({
  state = "idle",
  loadingText,
  spinnerColor = "#fff",
  spinnerSize = "small",
  style,
  textStyle,
  successDuration = 800,
  onSuccessEnd,
  children,
  disabled,
  ...pressableProps
}: LoadingButtonProps) {
  const scale = useSharedValue(1);
  const prevState = useRef(state);

  // Spring scale on state transitions
  useEffect(() => {
    if (state === "success" && prevState.current !== "success") {
      // Bounce on success
      scale.value = withSpring(1.05, { damping: 8, stiffness: 200 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      });
    }
    prevState.current = state;
  }, [state, scale]);

  // Auto-callback after success
  useEffect(() => {
    if (state === "success" && onSuccessEnd) {
      const timer = setTimeout(onSuccessEnd, successDuration);
      return () => clearTimeout(timer);
    }
  }, [state, successDuration, onSuccessEnd]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Press feedback
  const handlePressIn = () => {
    if (state !== "idle") return;
    scale.value = withTiming(0.97, {
      duration: 80,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    if (state !== "idle") return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const isDisabled = disabled || state === "loading" || state === "success";

  const renderContent = () => {
    switch (state) {
      case "loading":
        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size={spinnerSize} color={spinnerColor} />
            {loadingText ? (
              <Text style={[{ color: spinnerColor, fontSize: 14, fontWeight: "600" }, textStyle]}>
                {loadingText}
              </Text>
            ) : null}
          </View>
        );
      case "success":
        return <Check size={20} color={spinnerColor} strokeWidth={3} />;
      default:
        return children;
    }
  };

  return (
    <AnimatedPressable
      {...pressableProps}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          opacity: isDisabled && state === "idle" ? 0.5 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}
