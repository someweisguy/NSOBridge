import { useEffect, useState } from "react";
import { useGetter } from "./client";


export function useSeries(): Map<string, object> {
  const series: object = useGetter("series");
  const [seriesMap, setSeriesMap] = useState<Map<string, object>>(new Map(Object.entries(series)));

  useEffect(() => setSeriesMap(new Map(Object.entries(series))), [series]);

  return seriesMap
}