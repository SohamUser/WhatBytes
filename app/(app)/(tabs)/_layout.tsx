import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TaskTabIcon } from "@/components/TaskTabIcon";
import { AnimationCoordinatorProvider, useAnimationCoordinator } from "@/context/AnimationCoordinator";
import { useTasks } from "@/context/TaskContext";

function StickyTabs() {
  const { tasks } = useTasks();
  const { optimisticBadgeCount } = useAnimationCoordinator();
  const insets = useSafeAreaInsets();
  const activeCount = tasks.reduce((count, task) => count + (task.completed ? 0 : 1), 0);
  const badgeCount = activeCount + optimisticBadgeCount;

  return (
    <Tabs
      initialRouteName="create"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C65D3B",
        tabBarInactiveTintColor: "#78716C",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: "#FFFDF7",
          borderTopColor: "#D8C6A7",
          height: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarAccessibilityLabel: "Create a task",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "create" : "create-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarAccessibilityLabel: `Tasks, ${badgeCount} active`,
          tabBarBadge: badgeCount || undefined,
          tabBarBadgeStyle: { backgroundColor: "#C65D3B", color: "white", fontSize: 10 },
          tabBarIcon: ({ color, focused, size }) => (
            <TaskTabIcon color={color} focused={focused} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <AnimationCoordinatorProvider>
      <StickyTabs />
    </AnimationCoordinatorProvider>
  );
}
