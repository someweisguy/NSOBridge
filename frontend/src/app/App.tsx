import ScoreboardOperator from "./pages/operator.tsx";
import useSeries from "@/hooks/use-series.tsx";
import { useEffect, useState } from "react";
import { BoutIdContext } from "@/contexts/bout-id.tsx";

export default function App() {
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
      <ScoreboardOperator />
    </BoutIdContext.Provider>
  );
}
