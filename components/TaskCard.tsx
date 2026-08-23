import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { Task } from "@/types";
import { cn } from "@/utils/cn";
import { formatDueDate, isTaskOverdue } from "@/utils/date";

import { Card } from "./ui/Card";
import { Checkbox } from "./ui/Checkbox";
import { Chip } from "./ui/Chip";

interface TaskCardProps {
  task: Task;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onOpenMenu: () => void;
  onDelete: () => void;
}

interface SwipeDeleteActionProps {
  taskTitle: string;
  methods: SwipeableMethods;
  onDelete: () => void;
}

function SwipeDeleteAction({ taskTitle, methods, onDelete }: SwipeDeleteActionProps) {
  return (
    <Pressable
      accessibilityLabel={`Delete ${taskTitle}`}
      accessibilityRole="button"
      className="ml-2 h-full w-20 items-center justify-center rounded-xl bg-danger-600 active:bg-danger-700"
      onPress={() => {
        methods.close();
        onDelete();
      }}
    >
      <Ionicons className="text-white" name="trash-outline" size={22} />
      <Text className="mt-1 text-[10px] font-bold uppercase text-white">Delete</Text>
    </Pressable>
  );
}

export function TaskCard({
  task,
  busy,
  onToggle,
  onEdit,
  onOpenMenu,
  onDelete,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task.dueDate, task.completed);

  return (
    <View className="overflow-hidden rounded-2xl">
      <ReanimatedSwipeable
        enabled={!busy}
        friction={2}
        overshootRight={false}
        rightThreshold={36}
        renderRightActions={(_progress, _translation, methods) => (
          <SwipeDeleteAction taskTitle={task.title} methods={methods} onDelete={onDelete} />
        )}
      >
        <Card
          className={cn(
            "rounded-2xl p-0",
            busy && "opacity-60",
            task.completed && "bg-slate-50",
          )}
        >
          <View className="flex-row items-start px-4 pb-2 pt-4">
            <Pressable
              accessibilityHint="Opens the task editor. Long press for more actions."
              accessibilityLabel={`${task.title}, ${task.priority} priority`}
              className="min-h-12 min-w-0 flex-1 justify-center pr-2"
              disabled={busy}
              onLongPress={onOpenMenu}
              onPress={onEdit}
            >
              <Text
                className={cn(
                  "text-base font-semibold text-slate-900",
                  task.completed && "text-slate-400 line-through",
                )}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text
                  className={cn("mt-1 text-sm text-slate-500", task.completed && "line-through")}
                  numberOfLines={1}
                >
                  {task.description}
                </Text>
              ) : null}
              <View className="mt-2 flex-row items-center gap-1.5">
                <Ionicons
                  className={overdue ? "text-danger-600" : "text-slate-400"}
                  name={overdue ? "alert-circle-outline" : "calendar-outline"}
                  size={13}
                />
                <Text
                  className={cn(
                    "text-xs font-medium text-slate-500",
                    overdue && "font-bold text-danger-600",
                  )}
                >
                  {overdue ? "Overdue · " : "Due · "}
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            </Pressable>
            <View className="items-end">
              <Chip compact label={task.priority} tone={task.priority} />
              <Pressable
                accessibilityLabel={`More actions for ${task.title}`}
                accessibilityRole="button"
                className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-100"
                disabled={busy}
                onPress={onOpenMenu}
              >
                <Ionicons className="text-slate-400" name="ellipsis-horizontal" size={18} />
              </Pressable>
            </View>
          </View>
          <View className="border-t border-slate-200 px-2 py-1">
            <Checkbox
              checked={task.completed}
              disabled={busy}
              label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
              onPress={onToggle}
            />
          </View>
        </Card>
      </ReanimatedSwipeable>
    </View>
  );
}
