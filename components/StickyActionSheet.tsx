import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PaperTexture } from "@/components/PaperTexture";
import { TornEdgeSvg } from "@/components/TornEdgeSvg";

export interface StickyAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone?: "default" | "danger";
  onPress: () => void;
}

interface StickyActionSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: readonly StickyAction[];
  onClose: () => void;
}

export function StickyActionSheet({
  visible,
  title,
  message,
  actions,
  onClose,
}: StickyActionSheetProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View className="flex-1 justify-end bg-ink-900/45">
        <Pressable accessibilityLabel="Close menu" className="flex-1" onPress={onClose} />
        <SafeAreaView className="bg-[#FFF4B8]" edges={["bottom", "left", "right"]}>
          <View accessibilityViewIsModal className="relative overflow-hidden px-5 pb-4 pt-2">
            <PaperTexture />
            <TornEdgeSvg dashed />
            <View className="pb-3 pt-2">
              <Text className="text-3xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>
                {title}
              </Text>
              {message ? (
                <Text className="mt-1 text-base leading-6 text-ink-700" style={{ fontFamily: "Kalam_400Regular" }}>
                  {message}
                </Text>
              ) : null}
            </View>
            <View className="gap-2">
              {actions.map((action) => {
                const danger = action.tone === "danger";
                return (
                  <Pressable
                    key={action.label}
                    accessibilityRole="button"
                    className={`min-h-14 flex-row items-center rounded-xl border px-4 active:opacity-75 ${
                      danger
                        ? "border-danger-200 bg-[#FFF4EF]"
                        : "border-cork-500/25 bg-paper-50/80"
                    }`}
                    onPress={action.onPress}
                  >
                    <Ionicons color={danger ? "#B91C1C" : "#57534E"} name={action.icon} size={22} />
                    <Text
                      className={`ml-3 text-lg ${danger ? "text-danger-700" : "text-ink-900"}`}
                      style={{ fontFamily: "Kalam_700Bold" }}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                className="min-h-12 items-center justify-center rounded-xl active:bg-paper-200"
                onPress={onClose}
              >
                <Text className="text-lg text-ink-700" style={{ fontFamily: "Kalam_700Bold" }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
