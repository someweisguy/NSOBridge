import { useGetAllSeries } from "@/hooks/use-series";
import { Series } from "@/types/series";
import { useCallback, useEffect, useState } from "react";

export type UseSeriesPickerReturn = [
  Series | undefined,
  (series: Series) => void,
  Series[] | undefined,
];

/**
 * Select the desired Series with which to interface.
 *
 * This function behaves similarly to useBoutPicker.
 *
 * Fetches all the Series from the database and selects an "active" Series. The
 * `setActiveSeries` function sets the desired active Series. Only values found
 * within `allSeries` may be passed as an argument to `setActiveSeries`.
 *
 * @returns [activeSeries, setActiveSeries, allSeries]
 */
export default function useSeriesPicker(): UseSeriesPickerReturn {
  const { data: allSeries } = useGetAllSeries();

  // Declare the activeSeries and automatically set its initial value
  const [activeSeries, setActiveSeries] = useState<Series | undefined>(
    undefined,
  );
  useEffect(() => {
    if (allSeries != null && allSeries.length > 0 && activeSeries == null) {
      // Set the default active Series
      setActiveSeries(allSeries[0]);
    }
  }, [allSeries, activeSeries]);

  // Only allow valid Series to become the activeSeries
  const handleSetActiveSeries = useCallback(
    (series: Series) => {
      if (!allSeries?.some((s: Series) => s.uuid != series.uuid)) {
        throw new Error("Invalid Series selected: " + series.uuid);
      }
      setActiveSeries(series);
    },
    [allSeries],
  );

  return [activeSeries, handleSetActiveSeries, allSeries];
}
