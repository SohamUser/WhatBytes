import { ActivityIndicator, Pressable, PressableProps, Text, View } from "react-native";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const containerVariants: Record<ButtonVariant, string> = {
  primary: "border border-accent-700/20 bg-accent-500 active:bg-accent-600",
  secondary: "border border-cork-500/35 bg-paper-50 active:bg-paper-200",
  danger: "border border-danger-700/20 bg-danger-600 active:bg-danger-700",
  ghost: "bg-transparent active:bg-paper-200",
};

const labelVariants: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-ink-700",
  danger: "text-white",
  ghost: "text-ink-700",
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  leftIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "min-h-12 flex-row items-center justify-center rounded-2xl px-5 py-3 active:opacity-90",
        containerVariants[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator className={labelVariants[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text
            className={cn("text-[17px]", labelVariants[variant])}
            style={{ fontFamily: "Kalam_700Bold" }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
