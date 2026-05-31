import { useRedo } from "@/hooks/use-redo";
import { useUndo } from "@/hooks/use-undo";
import {
  ActionIcon,
  AppShell,
  AppShellProps,
  Burger,
  Group,
  Text,
} from "@mantine/core";
import { useDisclosure, useOs } from "@mantine/hooks";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { PropsWithChildren, ReactNode, Suspense, useEffect } from "react";

interface PageShellProps
  extends Pick<AppShellProps, "disabled">, PropsWithChildren {
  navButtons?: ReactNode;
  aside?: ReactNode;
}

/**
 * The main shell which wraps the application.
 */
export default function PageShell({
  navButtons,
  aside,
  disabled,
  children,
}: PageShellProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

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
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      aside={{
        width: 250,
        breakpoint: "sm",
      }}
      disabled={disabled}
    >
      <AppShell.Header>
        <Group h="100%" w="100%" justify="space-between" px="md">
          <Group align="center">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Text>NSO Bridge</Text>
          </Group>

          <Group>
            <ActionIcon variant="subtle" onClick={() => undo.mutate()}>
              <IconArrowBackUp size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => redo.mutate()}>
              <IconArrowForwardUp size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>{navButtons}</AppShell.Navbar>
      <AppShell.Aside p="xs">{aside}</AppShell.Aside>

      <AppShell.Main>
        {/* TODO: Add error boundary */}
        <Suspense fallback={"Loading..."}>{children}</Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
