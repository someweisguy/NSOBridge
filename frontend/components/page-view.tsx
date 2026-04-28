import { BoutUriProvider } from "@/hooks/use-bout-uri-context";
import { useGetAllBouts } from "@/hooks/use-get-all-bouts";
import queryClient from "@/lib/cache";
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
import { QueryClientProvider } from "@tanstack/react-query";
import {
  PropsWithChildren,
  StrictMode,
  Suspense,
  useEffect,
  useState,
} from "react";
import CreateBoutButton from "./create-bout-button";

const urlParams = new URLSearchParams(window.location.search);
const boutUuidParam = urlParams.get("boutUuid");

interface PageViewProps
  extends
    Omit<AppShellProps, "data" | "onChange">,
    Pick<SelectProps, "onChange">,
    PropsWithChildren {
  /**
   * The data which should be shown in the Bout Picker combo box. The label is the
   * display name which should be shown and the value corresponds to the Bout UUID.
   */
  boutData?: { value: string; label: string }[];
  /**
   * The names of all the Rulesets that are supported by the server.
   */
  rulesetNames?: string[];
  /**
   * True to use the app shell. The shell should typically be used except on pages such
   * as the scoreboard or the broadcast overlay.
   */
  withShell?: boolean;
}

/**
 * The main shell which wraps the application.
 */
export default function PageView({
  boutData,
  rulesetNames,
  withShell,
  onChange,
  disabled,
  children,
}: PageViewProps) {
  // TODO: const { data: syncData } = useSuspenseGetSyncData();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const {
    data: bouts,
    isPending,
    isEnabled,
  } = useGetAllBouts({
    enabled: boutUuidParam == null || withShell,
  });
  const [boutUuid, setBoutUuid] = useState<string | null>(boutUuidParam);

  useEffect(() => {
    if (
      isEnabled &&
      !isPending &&
      bouts != null &&
      boutUuidParam == null &&
      boutUuid == null
    ) {
      // Only gets called once - when there is no boutUuid selected
      setBoutUuid(bouts[0].uuid);
    }
  }, [bouts, boutUuid, isPending, isEnabled]);

  if (boutUuid == null) {
    return <></>;
  }

  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
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
              <CreateBoutButton
                rulesetNames={rulesetNames ?? []}
                disabled={rulesetNames == null}
              />
              <Select
                allowDeselect={false}
                data={boutData}
                defaultValue={boutUuid}
                onChange={onChange}
              />
              <Button
                onClick={() => window.open("sb?boutUuid=" + boutUuid, "_blank")}
              >
                Open Scoreboard
              </Button>
            </AppShell.Navbar>

            <AppShell.Main>
              <BoutUriProvider value={{ boutUuid }}>
                <Suspense fallback={"Loading..."}>{children}</Suspense>
              </BoutUriProvider>
            </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
