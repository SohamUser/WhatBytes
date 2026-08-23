import { Input } from "./Input";

type TextAreaProps = React.ComponentProps<typeof Input>;

export function TextArea(props: TextAreaProps) {
  return (
    <Input
      multiline
      numberOfLines={5}
      textAlignVertical="top"
      className="min-h-32"
      {...props}
    />
  );
}
