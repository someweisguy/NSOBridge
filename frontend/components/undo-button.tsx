import { useUndo } from "@/hooks/use-undo";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconArrowBackUp } from "@tabler/icons-react";

/**
 * Used to undo the last action that was performed by the user. Undo histories are
 * tracked per-user.
 */
export default function UndoButton({
  ...props
}: Omit<ActionIconProps, "onClick">) {
  const undo = useUndo();

  return (
    <ActionIcon onClick={() => undo.mutate()} {...props}>
      <IconArrowBackUp />
    </ActionIcon>
  );
}
