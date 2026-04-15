import { View, Image } from "react-native";

interface GrahamLogoProps {
  variant?: "full" | "swirl";
  width?: number;
}

const LOGO_SOURCE = require("../assets/Graham-Packaging-Logo-RGB (2).png");

const FULL_ASPECT = 3.2;
const SWIRL_FRACTION = 0.30;

export function GrahamLogo({
  variant = "full",
  width: requestedWidth,
}: GrahamLogoProps) {
  if (variant === "full") {
    const w = requestedWidth ?? 260;
    const h = w / FULL_ASPECT;

    return (
      <Image
        source={LOGO_SOURCE}
        style={{ width: w, height: h }}
        resizeMode="contain"
      />
    );
  }

  const swirlSize = requestedWidth ?? 36;
  const fullImageWidth = swirlSize / SWIRL_FRACTION;
  const fullImageHeight = fullImageWidth / FULL_ASPECT;

  return (
    <View
      style={{
        width: swirlSize,
        height: swirlSize,
        overflow: "hidden",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Image
        source={LOGO_SOURCE}
        style={{
          width: fullImageWidth,
          height: fullImageHeight,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
