import { PropsWithChildren, ReactNode } from "react";
import { useSeries } from "../hooks/series";
import { SeriesContext } from "../App";

export default function MainContainer({
  children,
}: PropsWithChildren): ReactNode {
  const bouts: Map<string, object> = useSeries();

  return (
    <div className="container flex flex-col w-full h-svh max-h-svh">
      {/* Header items go here */}
      <div className="container sticky top-0 flex flex-row items-center p-4 shadow-md place-content-start bg-slate-400 max-h-16">
        <img src="skate.svg" className="flex-initial h-full pl-2"></img>
        <div className="flex-none h-full px-6 place-content-center">
          <strong>NSO Bridge</strong>
        </div>
      </div>

      <SeriesContext.Provider value={bouts}>{children}</SeriesContext.Provider>
    </div>
  );
}
