import PageView from "@/components/page-view";
import { BoutUriProvider } from "@/hooks/use-bout-uri-context";
import { useGetAllBouts } from "@/hooks/use-get-all-bouts";
import { useSuspenseGetSyncData } from "@/hooks/use-suspense-get-sync-data";
import { SyncDataProvider } from "@/hooks/use-sync-context";
import queryClient from "@/lib/cache";
import { Bout } from "@/types/bout";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, StrictMode, useEffect, useState } from "react";

const urlParams = new URLSearchParams(window.location.search);
const boutUuidParam = urlParams.get("boutUuid");

interface PageContainerProps extends PropsWithChildren {
  /**
   * True to use the app shell. The shell should typically be used except on pages such
   * as the scoreboard or the broadcast overlay.
   */
  withShell?: boolean;
}

/**
 * Display the page with all the required contexts for the app to run properly. In other
 * words, every page should be wrapped with this component.
 */
export default function PageContainer({
  withShell: useShell = false,
  children,
}: PageContainerProps) {
  const { data: syncData } = useSuspenseGetSyncData();
  const {
    data: bouts,
    isPending,
    isEnabled,
  } = useGetAllBouts({
    enabled: boutUuidParam == null || useShell,
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
        <PageView
          boutData={bouts?.map((bout: Bout) => ({
            value: bout.uuid,
            label: `${bout.teams[0].name} vs. ${bout.teams[1].name}`,
          }))}
          disabled={!useShell}
          onChange={setBoutUuid}
          selectedBoutUuid={boutUuid}
        >
          <QueryClientProvider client={queryClient}>
            <SyncDataProvider value={syncData}>
              <BoutUriProvider value={{ boutUuid }}>{children}</BoutUriProvider>
            </SyncDataProvider>
          </QueryClientProvider>
        </PageView>
      </MantineProvider>
    </StrictMode>
  );
}
