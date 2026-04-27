import React from "react";
import { render } from "@testing-library/react";

// Mock reanimated — must use only in-scope references
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: {
    View: require("react").forwardRef((props: any, ref: any) =>
      require("react").createElement("div", { ...props, ref })
    ),
    createAnimatedComponent: (comp: any) => comp,
  },
  useSharedValue: (val: number) => ({ value: val }),
  useAnimatedStyle: () => ({}),
  withRepeat: (val: any) => val,
  withTiming: (val: any) => val,
  interpolate: () => 0.5,
  Easing: { inOut: (fn: any) => fn, ease: (val: any) => val },
}));

import SkeletonBox from "../../components/SkeletonBox";

describe("SkeletonBox", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkeletonBox width={100} height={50} />);
    expect(container).toBeTruthy();
  });

  it("renders with string dimensions", () => {
    const { container } = render(<SkeletonBox width="100%" height="50%" />);
    expect(container).toBeTruthy();
  });

  it("renders with custom borderRadius", () => {
    const { container } = render(<SkeletonBox width={100} height={50} borderRadius={16} />);
    expect(container).toBeTruthy();
  });
});
