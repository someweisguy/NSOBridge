import { useRedo } from "@/hooks/use-redo";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconArrowForwardUp } from "@tabler/icons-react";

/**
 * Used to redo the last action that was undone by the user. Undo histories are tracked
 * per-user.
 */
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
