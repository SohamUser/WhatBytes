import { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { PaperTexture } from "@/components/PaperTexture";

interface StickyNoteProps extends PropsWithChildren {
  color?: string;
  rotation?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function StickyNote({
  children,
  color = "#FFEB7A",
  rotation = 0,
  style,
  className,
}: StickyNoteProps) {
  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: color,
          borderRadius: 5,
          shadowColor: "#3F3219",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
          transform: [{ rotate: `${rotation}deg` }],
          overflow: "hidden",
        },
        style,
      ]}
    >
      <PaperTexture />
      {children}
    </View>
  );
}
