import React from "react";
import { View } from "react-native";
import SkeletonBox from "./SkeletonBox";

export default function SkeletonRail() {
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <SkeletonBox width={120} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={{ gap: 6 }}>
            <SkeletonBox width={110} height={165} borderRadius={8} />
            <SkeletonBox width={90} height={12} borderRadius={4} />
            <SkeletonBox width={60} height={10} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
