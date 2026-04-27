/**
 * usePressAnimation — Shared Reanimated press feedback hook.
 *
 * Provides spring-based scale animation for any Pressable element.
 * Mirrors the pattern already used in DramaRail (the best press feel in the app).
 *
 * Variants:
 *   "button"  — standard buttons/CTAs (scale 0.97, moderate spring)
 *   "icon"    — small icon buttons like back/close/share (scale 0.90, snappy spring)
 *   "card"    — content cards (scale 0.97, softer spring with lower mass)
 *   "chip"    — genre chips, tags, speed options (scale 0.93 + opacity 0.8)
 *
 * Usage:
 *   const { animatedStyle, onPressIn, onPressOut } = usePressAnimation("button");
 *   <Animated.View style={animatedStyle}>
 *     <Pressable onPressIn={onPressIn} onPressOut={onPressOut} ... />
 *   </Animated.View>
 */
import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

type PressVariant = "button" | "icon" | "card" | "chip";

const CONFIGS: Record<
  PressVariant,
  {
    pressScale: number;
    pressOpacity: number;
    pressDuration: number;
    springDamping: number;
    springStiffness: number;
    springMass: number;
  }
> = {
  button: {
    pressScale: 0.97,
    pressOpacity: 1,
    pressDuration: 80,
    springDamping: 15,
    springStiffness: 150,
    springMass: 1,
  },
  icon: {
    pressScale: 0.9,
    pressOpacity: 1,
    pressDuration: 60,
    springDamping: 12,
    springStiffness: 200,
    springMass: 1,
  },
  card: {
    pressScale: 0.97,
    pressOpacity: 1,
    pressDuration: 100,
    springDamping: 15,
    springStiffness: 150,
    springMass: 0.6,
  },
  chip: {
    pressScale: 0.93,
    pressOpacity: 0.8,
    pressDuration: 80,
    springDamping: 15,
    springStiffness: 150,
    springMass: 1,
  },
};

export function usePressAnimation(variant: PressVariant = "button") {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const config = CONFIGS[variant];

  const onPressIn = useCallback(() => {
    scale.value = withTiming(config.pressScale, {
      duration: config.pressDuration,
      easing: Easing.out(Easing.ease),
    });
    if (config.pressOpacity < 1) {
      opacity.value = withTiming(config.pressOpacity, {
        duration: config.pressDuration,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [scale, opacity, config]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: config.springDamping,
      stiffness: config.springStiffness,
      mass: config.springMass,
    });
    if (config.pressOpacity < 1) {
      opacity.value = withSpring(1, {
        damping: config.springDamping,
        stiffness: config.springStiffness,
        mass: config.springMass,
      });
    }
  }, [scale, opacity, config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle, onPressIn, onPressOut } as const;
}
