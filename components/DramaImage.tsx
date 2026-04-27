import React, { useState, useEffect } from "react";
import { Image, ImageContentPosition } from "expo-image";

const PLACEHOLDER = "https://placehold.co/200x356/1a1a2e/8b5cf6?text=Poster";

interface DramaImageProps {
  uri: string;
  alt: string;
  width: number;
  height: number;
  contentFit?: "cover" | "contain" | "fill";
  contentPosition?: ImageContentPosition;
  className?: string;
}

export function DramaImage({
  uri,
  alt,
  width,
  height,
  contentFit = "cover",
  contentPosition = "center",
  className,
}: DramaImageProps) {
  const [src, setSrc] = useState(uri || PLACEHOLDER);

  useEffect(() => {
    setSrc(uri || PLACEHOLDER);
  }, [uri]);

  const handleError = () => {
    setSrc((prev) => (prev === PLACEHOLDER ? prev : PLACEHOLDER));
  };

  return (
    <Image
      source={{ uri: src }}
      style={{ width, height }}
      contentFit={contentFit}
      contentPosition={contentPosition}
      onError={handleError}
      transition={300}
      className={className}
      accessibilityLabel={alt}
    />
  );
}
