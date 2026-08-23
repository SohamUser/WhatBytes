import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";

import { Input } from "./Input";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "rightElement" | "secureTextEntry">;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      {...props}
      secureTextEntry={!isVisible}
      rightElement={
        <Pressable
          accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-xl active:bg-slate-100"
          onPress={() => setIsVisible((current) => !current)}
        >
          <Ionicons
            className="text-slate-500"
            name={isVisible ? "eye-off-outline" : "eye-outline"}
            size={21}
          />
        </Pressable>
      }
    />
  );
}
