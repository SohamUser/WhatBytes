import { PropsWithChildren } from "react";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface AuthShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-4 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-brand-100" />
          <View className="absolute -left-32 top-10 h-52 w-52 rounded-full bg-brand-50" />
          <View className="mx-auto w-full max-w-md">
            <View className="mb-8 items-center">
              <View className="relative mb-6">
                <View className="absolute -left-5 top-2 h-2 w-2 rounded-full bg-warning-500" />
                <View className="absolute -right-5 top-0 h-2 w-2 rounded-full bg-brand-200" />
                <View className="absolute -right-7 bottom-2 h-1.5 w-1.5 rounded-full bg-slate-700" />
                <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 shadow-lg">
                  <Ionicons className="text-white" name="checkmark" size={46} />
                </View>
              </View>
              <Text className="text-sm font-bold tracking-wide text-brand-700">
                {eyebrow}
              </Text>
              <Text className="mt-3 text-center text-3xl font-bold tracking-tight text-slate-950">
                {title}
              </Text>
              <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-slate-500">
                {subtitle}
              </Text>
            </View>

            <View className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
