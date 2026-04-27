import React from "react";
import { View, Dimensions } from "react-native";
import SkeletonBox from "./SkeletonBox";

const { width: screenW, height: screenH } = Dimensions.get("window");
const heroHeight = Math.min(Math.max(screenH * 0.55, 300), 500);

export default function SkeletonHero() {
  return (
    <View style={{ width: screenW, height: heroHeight, paddingHorizontal: 24, justifyContent: "flex-end", paddingBottom: 40 }}>
      <SkeletonBox width={screenW} height={heroHeight} borderRadius={0} style={{ position: "absolute", top: 0, left: 0 }} />
      <View style={{ gap: 10, zIndex: 1 }}>
        <SkeletonBox width={80} height={22} borderRadius={12} />
        <SkeletonBox width={220} height={28} borderRadius={6} />
        <SkeletonBox width={160} height={16} borderRadius={4} />
      </View>
    </View>
  );
}
