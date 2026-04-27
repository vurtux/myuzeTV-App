import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

// Use the same logo as login screen
import { LOGO_IMAGE } from "../lib/drama-data";

interface SplashTransitionProps {
  isReady: boolean;
  onComplete: () => void;
}

export function SplashTransition({ isReady, onComplete }: SplashTransitionProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasStartedExit = useRef(false);

  // Breathing pulse while loading
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      false
    );
  }, [scale]);

  // Exit animation when ready
  useEffect(() => {
    if (isReady && !hasStartedExit.current) {
      hasStartedExit.current = true;
      // Stop pulsing, scale down and fade out
      scale.value = withTiming(0.9, { duration: 300, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(onComplete)();
      });
    }
  }, [isReady, scale, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={LOGO_IMAGE}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 56,
  },
});
