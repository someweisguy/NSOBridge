import { ReactNode, Suspense, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import useSeries from "../hooks/useSeries";
import { BoutIdContext } from "../contexts/BoutIdContext";

type SidebarProps = {
  children?: ReactNode;
  spinner?: ReactNode;
};

export default function Sidebar({
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
    <div className="flex flex-row min-h-screen min-w-screen">
      <div className="relative flex-initial min-h-full border-0 min-w-32 bg-raisin-100 border-e-1 border-raisin-300">
        <div className="sticky top-0 left-0 flex flex-col items-start gap-2 p-4">
          <div className="text-2xl font-bold">NSO Bridge</div>
          <div>Sidebar 2</div>
          <div>Sidebar 3</div>
          <div>Sidebar 4</div>
          <div>Sidebar 5</div>
        </div>
      </div>
      <div className="flex-1 p-4 h-fit bg-raisin-50">
        <Suspense fallback={spinner}>
          <BoutIdContext.Provider value={boutId}>
            {children}
          </BoutIdContext.Provider>
        </Suspense>
      </div>
    </div>
  );
}
