import { useAllRulesetNames } from "@/hooks/use-all-ruleset-names";
import {
  AppShell,
  AppShellProps,
  Burger,
  Button,
  MantineProvider,
  Select,
  SelectProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { StrictMode, Suspense } from "react";
import CreateBoutButton from "./create-bout-button";

interface PageViewProps
  extends
    Omit<AppShellProps, "data" | "onChange">,
    Pick<SelectProps, "onChange"> {
  /**
   * The data which should be shown in the Bout Picker combo box. The label is the
   * display name which should be shown and the value corresponds to the Bout UUID.
   */
  boutData?: { value: string; label: string }[];
  /**
   * The Bout UUID which is currently selected.
   */
  selectedBoutUuid: string;
}

/**
 * The main shell which wraps the application.
 */
export default function PageView({
  boutData,
  selectedBoutUuid,
  onChange,
  disabled,
  children,
}: PageViewProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { data: rulesetNames } = useAllRulesetNames({ throwOnError: true });

  return (
    <StrictMode>
      <MantineProvider>
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

          <AppShell.Navbar>
            <CreateBoutButton rulesetNames={rulesetNames!} />
            <Select
              allowDeselect={false}
              data={boutData}
              defaultValue={selectedBoutUuid}
              onChange={onChange}
            />
            <Button
              onClick={() =>
                window.open("sb?boutUuid=" + selectedBoutUuid, "_blank")
              }
            >
              Open Scoreboard
            </Button>
          </AppShell.Navbar>

          <AppShell.Main>
            <Suspense fallback={"Loading..."}>{children}</Suspense>
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </StrictMode>
  );
}
