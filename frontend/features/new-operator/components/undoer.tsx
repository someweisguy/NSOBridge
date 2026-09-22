import { useRedo } from "@/hooks/use-redo";
import { useUndo } from "@/hooks/use-undo";
import {
  ActionIcon,
  ActionIconProps,
  Group,
  GroupProps,
  Tooltip,
} from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useEffect } from "react";

/**
 * Render a component for undo and redo.
 *
 * Also registers hotkeys Ctrl+Z and Ctrl+Y (or Cmd+Z and Cmd+Y).
 */
export default function Undoer({
  gap = "md",
  variant = "subtle",
}: Pick<ActionIconProps, "variant"> & Pick<GroupProps, "gap">) {
  const os = useOs();
  const { mutate: undo } = useUndo();
  const { mutate: redo } = useRedo();

  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      if (
        (os == "windows" && event.ctrlKey) ||
        (os != "windows" && event.metaKey)
      ) {
        if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          void undo();
        }
        if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          void redo();
        }
      }
    };

    document.addEventListener("keydown", eventHandler);
    return () => document.removeEventListener("keydown", eventHandler);
  }, [os, undo, redo]);

  return (
    <Group gap={gap}>
      <Tooltip withArrow fz="xs" label="Undo">
        <ActionIcon variant={variant} onClick={() => undo()}>
          <IconArrowBackUp size="70%" />
        </ActionIcon>
      </Tooltip>
      <Tooltip withArrow fz="xs" label="Redo">
        <ActionIcon variant={variant} onClick={() => redo()}>
          <IconArrowForwardUp size="70%" />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
