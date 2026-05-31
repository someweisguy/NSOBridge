import { useRedo } from "@/hooks/use-redo";
import { useUndo } from "@/hooks/use-undo";
import {
  ActionIcon,
  AppShell,
  AppShellProps,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { PropsWithChildren, ReactNode, Suspense, useEffect } from "react";

interface PageShellProps
  extends Pick<AppShellProps, "disabled">, PropsWithChildren {
  header?: ReactNode;
  navButtons?: ReactNode;
  aside?: ReactNode;
}

/**
 * The main shell which wraps the application.
 */
export default function PageShell({
  header,
  navButtons,
  aside,
  disabled,
  children,
}: PageShellProps) {
  const os = useOs();
  const undo = useUndo();
  const redo = useRedo();

  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      if (
        (os == "windows" && event.ctrlKey) ||
        (os != "windows" && event.metaKey)
      ) {
        if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          void undo.mutate();
        }
        if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          void redo.mutate();
        }
      }
    };

    document.addEventListener("keydown", eventHandler);
    return () => document.removeEventListener("keydown", eventHandler);
  }, [os, undo, redo]);

  return (
    <AppShell
      padding="md"
      header={{ height: 48 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
      }}
      aside={
        aside != null
          ? {
              width: 200,
              breakpoint: "sm",
            }
          : undefined
      }
      disabled={disabled}
    >
      <AppShell.Header>
        <Group h="100%" w="100%" justify="space-between" px="md">
          <Group align="center">
            <Text>NSO Bridge</Text>
          </Group>

          <Group gap="xs">
            {header}
            <Tooltip withArrow fz="xs" label="Undo">
              <ActionIcon variant="subtle" onClick={() => undo.mutate()}>
                <IconArrowBackUp size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip withArrow fz="xs" label="Redo">
              <ActionIcon variant="subtle" onClick={() => redo.mutate()}>
                <IconArrowForwardUp size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">{navButtons}</AppShell.Navbar>
      {aside != null && <AppShell.Aside>{aside}</AppShell.Aside>}

      <AppShell.Main>
        {/* TODO: Add error boundary */}
        <Suspense fallback={"Loading..."}>{children}</Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
