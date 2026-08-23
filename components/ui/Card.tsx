import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

import { cn } from "@/utils/cn";

export function Card({ children, className, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View
      className={cn("rounded-2xl border border-slate-100 bg-white p-4 shadow-sm", className)}
      {...props}
    >
      {children}
    </View>
  );
}
