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
import { useDisclosure } from "@mantine/hooks";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { PropsWithChildren, ReactNode, Suspense } from "react";

interface PageShellProps
  extends Pick<AppShellProps, "disabled">, PropsWithChildren {
  navButtons?: ReactNode[];
}

/**
 * The main shell which wraps the application.
 */
export default function PageShell({
  navButtons,
  disabled,
  children,
}: PageShellProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const undo = useUndo();
  const redo = useRedo();

  return (
    <AppShell
      padding="md"
      header={{ height: 48 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
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

      <AppShell.Main>
        {/* TODO: Add error boundary */}
        <Suspense fallback={"Loading..."}>{children}</Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
