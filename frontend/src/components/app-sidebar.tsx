import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import useSeries from "@/hooks/useSeries.ts";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { BoutIdContext } from "@/contexts/BoutIdContext.ts";
import LoadingSpinner from "./LoadingSpinner";

type SidebarProps = {
  children?: ReactNode;
  spinner?: ReactNode;
};

export default function AppSidebar({
  children,
  spinner = <LoadingSpinner />,
}: SidebarProps): ReactNode {
  const series: Map<string, object> = useSeries();
  const [boutId, setBoutId] = useState<string>(
    series.size > 0 ? series.keys().next().value! : ""
  );

  // Automatically select a Bout with which to interact
  useEffect(() => {
    if (boutId && series.has(boutId)) {
      return; // Do nothing
    } else if (series.size > 0) {
      if (boutId) {
        // TODO: notify client that the Bout has been deleted
      }
      setBoutId(series.keys().next().value!);
    } else {
      // TODO: Go to Bout creation page
    }
  }, [boutId, series]);

  return (
    <BoutIdContext.Provider value={boutId}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            NSO Bridge
          </SidebarHeader>
          <SidebarContent />
          <SidebarFooter>
            <SidebarTrigger />
          </SidebarFooter>
        </Sidebar>
        <Suspense fallback={spinner}>{children}</Suspense>
      </SidebarProvider>
    </BoutIdContext.Provider>
  );
}
