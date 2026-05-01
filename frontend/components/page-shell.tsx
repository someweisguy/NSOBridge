import { AppShell, AppShellProps, Burger } from "@mantine/core";
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
      header={{ height: 40 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      disabled={disabled}
    >
      <AppShell.Header>
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
      </AppShell.Header>

      <AppShell.Navbar>{navButtons}</AppShell.Navbar>

      <AppShell.Main>
        {/* TODO: Add error boundary */}
        <Suspense fallback={"Loading..."}>{children}</Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
