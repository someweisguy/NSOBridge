import useSeries from "@/hooks/use-series";
import { Series } from "@/lib/client/api/series";
import { createContext, useEffect, useRef, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const BoutIdContext = createContext<[string, React.Dispatch<string>]>([
  "",
  () => "",
]);

export function BoutIdProvider({ children }: React.PropsWithChildren) {
  const series: Series = useSeries();
  const [boutId, setBoutId] = useState<string>(() => {
    if (series.length === 0) {
      // TODO: Go to Bout Creation page
    } else if (series.length > 1) {
      // TODO: Go to Choose A Bout page
    }
    return series[0].id;
  });
  const lastBoutId = useRef<string>(boutId);

  useEffect(() => {
    const boutIds = Array.from(series, (bout) => bout.id);
    if (boutIds.includes(boutId)) {
      lastBoutId.current = boutId;
      return; // Do nothing - the new Bout ID is valid
    }

    if (boutId === lastBoutId.current) {
      // Oops! The Bout has been deleted
      // TODO: Go to Choose A Bout page
    }

    // An invalid Bout ID has been set - revert it to the old value
    setBoutId(lastBoutId.current);
  }, [boutId, series]);

  return (
    <BoutIdContext.Provider value={[boutId, setBoutId]}>
      {children}
    </BoutIdContext.Provider>
  );
}
