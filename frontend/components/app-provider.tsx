import BoutPicker from "@/components/bout-picker";
import { useGetAllBouts } from "@/hooks/use-get-all-bouts";
import { useSuspenseGetSyncData } from "@/hooks/use-suspense-get-sync-data";
import queryClient from "@/lib/cache";
import { Bout } from "@/lib/game/bouts";
import { BoutUuidContext, ServerOffsetContext } from "@/utils/contexts";
import { AppShell, Burger, Button, MantineProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  PropsWithChildren,
  StrictMode,
  Suspense,
  useEffect,
  useState,
} from "react";

const urlParams = new URLSearchParams(window.location.search);
const boutUuidParamName = "boutUuid";

interface AppProviderProps extends PropsWithChildren {
  useShell?: boolean;
}

// TODO: make testable

export default function AppProvider({
  useShell = false,
  children,
}: AppProviderProps) {
  const [opened, { toggle }] = useDisclosure();

  const {
    data: bouts,
    isPending,
    isEnabled,
  } = useGetAllBouts({
    enabled: !urlParams.has(boutUuidParamName) || useShell,
  });

  const [boutUuid, setBoutUuid] = useState<string | null>(
    urlParams.get(boutUuidParamName),
  );

  const { data: syncData } = useSuspenseGetSyncData();

  useEffect(() => {
    if (
      isEnabled &&
      !isPending &&
      bouts != null &&
      !urlParams.has(boutUuidParamName)
    ) {
      setBoutUuid(bouts[0].uuid);
    }
  }, [bouts, isPending, isEnabled]);

  if (boutUuid == null) {
    return <></>;
  }

  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <ServerOffsetContext value={syncData.offset}>
            <BoutUuidContext value={boutUuid}>
              {useShell ? (
                <AppShell
                  padding="md"
                  header={{ height: 60 }}
                  navbar={{
                    width: 200,
                    breakpoint: "sm",
                    collapsed: { mobile: !opened },
                  }}
                >
                  <AppShell.Header>
                    <Burger
                      opened={opened}
                      onClick={toggle}
                      hiddenFrom="sm"
                      size="sm"
                    />
                  </AppShell.Header>

                  <AppShell.Navbar m="md">
                    <BoutPicker
                      data={bouts!.map((bout: Bout) => ({
                        value: bout.uuid,
                        label: `${bout.teams[0].name} vs. ${bout.teams[1].name}`,
                      }))}
                      onChange={(uuid: string | null) => setBoutUuid(uuid)}
                    />
                    <Button
                      onClick={() =>
                        window.open("sb?boutUuid=" + boutUuid, "_blank")
                      }
                    >
                      Open Scoreboard
                    </Button>
                  </AppShell.Navbar>

                  <AppShell.Main>
                    <Suspense fallback={"Loading..."}>{children}</Suspense>
                  </AppShell.Main>
                </AppShell>
              ) : (
                children
              )}
            </BoutUuidContext>
          </ServerOffsetContext>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
