import { PropsWithChildren } from "react";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { StickyNote } from "@/components/StickyNote";

interface AuthShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-paper-100">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-4 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cork-300/35" />
          <View className="absolute -left-32 top-10 h-52 w-52 rounded-full bg-[#FFEB7A]/35" />
          <View className="mx-auto w-full max-w-md">
            <View className="mb-8 items-center">
              <View className="relative mb-6">
                <View className="absolute -left-5 top-2 h-2 w-2 rounded-full bg-accent-500" />
                <View className="absolute -right-5 top-0 h-2 w-2 rounded-full bg-cork-500" />
                <View className="absolute -right-7 bottom-2 h-1.5 w-1.5 rounded-full bg-ink-700" />
                <View className="h-20 w-20 rotate-[-3deg] items-center justify-center rounded-sm bg-[#FFEB7A] shadow-lg">
                  <Ionicons color="#57534E" name="checkmark" size={46} />
                </View>
              </View>
              <Text className="text-sm font-bold uppercase tracking-[2px] text-accent-600">
                {eyebrow}
              </Text>
              <Text className="mt-3 text-center text-4xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>
                {title}
              </Text>
              <Text className="mt-2 max-w-sm text-center text-base leading-6 text-ink-500" style={{ fontFamily: "Kalam_400Regular" }}>
                {subtitle}
              </Text>
            </View>

            <StickyNote color="#FFF4B8" rotation={0.45}>
              <View className="p-5 sm:p-6">{children}</View>
            </StickyNote>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
