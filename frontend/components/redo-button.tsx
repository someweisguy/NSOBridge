import { useRedo } from "@/hooks/use-redo";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconArrowForwardUp } from "@tabler/icons-react";

export default function RedoButton({
  ...props
}: Omit<ActionIconProps, "onClick">) {
  const redo = useRedo();

  return (
    <ActionIcon onClick={() => redo.mutate()} {...props}>
      <IconArrowForwardUp />
    </ActionIcon>
  );
}
