import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import useSeries from "../hooks/useSeries";
import { BoutIdContext } from "../contexts/BoutIdContext";

export default function MainContainer({
  children,
}: PropsWithChildren): ReactNode {
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
    <div className="flex flex-col w-full min-w-full h-svh max-h-svh">
      {/* Header items go here */}
      <div className="sticky top-0 flex flex-row items-center p-4 shadow-md place-content-start bg-slate-400 max-h-16">
        <img src="skate.svg" className="flex-none h-full pl-2"></img>
        <div className="flex-none h-full px-6 place-content-center">
          <strong>NSO Bridge</strong>
        </div>
      </div>

      <div className="overflow-clip">
        <BoutIdContext.Provider value={boutId}>
          {children}
        </BoutIdContext.Provider>
      </div>
    </div>
  );
}
