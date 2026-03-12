import { useGetAllBouts } from "@/hooks/use-get-all-bouts";
import { useSuspenseGetSyncData } from "@/hooks/use-suspense-get-sync-data";
import queryClient from "@/lib/cache";
import { Bout } from "@/lib/game/bouts";
import { BoutUuidContext, ServerOffsetContext } from "@/utils/contexts";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, StrictMode, useEffect, useState } from "react";
import PageView from "./page-view";

const urlParams = new URLSearchParams(window.location.search);
const boutUuidParam = urlParams.get("boutUuid");

interface PageContainerProps extends PropsWithChildren {
  /**
   * True to use the app shell. The shell should typically be used except on pages such
   * as the scoreboard or the broadcast overlay.
   */
  useShell?: boolean;
}

/**
 * Display the page with all the required contexts for the app to run properly. In other
 * words, every page should be wrapped with this component.
 */
export default function PageContainer({
  useShell = false,
  children,
}: PageContainerProps) {
  const [boutUuid, setBoutUuid] = useState<string | null>(boutUuidParam);
  const { data: syncData } = useSuspenseGetSyncData();
  const {
    data: bouts,
    isPending,
    isEnabled,
  } = useGetAllBouts({
    enabled: boutUuidParam == null || useShell,
  });

  useEffect(() => {
    if (isEnabled && !isPending && bouts != null && boutUuidParam == null) {
      setBoutUuid(bouts[0].uuid);
    }
  }, [bouts, isPending, isEnabled]);

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
            <ServerOffsetContext value={syncData.offset}>
              <BoutUuidContext value={boutUuid}>{children}</BoutUuidContext>
            </ServerOffsetContext>
          </QueryClientProvider>
        </PageView>
      </MantineProvider>
    </StrictMode>
  );
}
