import {
  AppShell,
  AppShellProps,
  Burger,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
          <Button>Navigation Button</Button>
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
