import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { Series } from "@/types/series";
import { boutKeys } from "@/utils/query-keys";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export type UseBoutPickerReturn = [
  Bout | undefined,
  (bout: Bout) => void,
  Bout[] | undefined,
];

/**
 * Select the desired Bout with which to interface.
 *
 * This function behaves similarly to useSeriesPicker.
 *
 * Fetches all the Bouts from the database and selects an "active" Bout. The
 * `setActiveBout` function sets the desired active Bout. Only values found
 * within `bouts` may be passed as an argument to `setActiveBout`.
 *
 * @param series The Series whose Bouts should be queried.
 * @returns [activeBout, setActiveBout, bouts]
 */
export default function useBoutPicker(
  series: Series | undefined,
): UseBoutPickerReturn {
  // Query all the Bouts in the Series
  const { data: bouts, isPending } = useQueries({
    queries:
      series?.boutUuids.map((boutUuid: string) => ({
        queryKey: boutKeys.one(boutUuid),
        queryFn: () =>
          localAPI.get<Bout>("bout", {
            query: { boutUuid },
          }),
        enabled: series != null,
      })) ?? [],
    combine: useCallback(
      (results: UseQueryResult<Bout, Error>[]) => ({
        data: results
          .filter((result) => result.data != null)
          .map((result) => result.data),
        isPending: results.some((result) => result.isPending),
      }),
      [],
    ),
  });

  // Set the default activeBout
  const [activeBout, setActiveBout] = useState<Bout | undefined>(undefined);
  useEffect(() => {
    if (!isPending && activeBout == null && series != null) {
      const bout = bouts.find((b?: Bout) => b?.uuid == series.activeBoutUuid);
      setActiveBout(bout ?? bouts[0]);
    }
    // TODO: Handle situation where the series changes
  }, [bouts, isPending, activeBout, series]);

  // Only allow valid Bouts to become the activeBout
  const handleSetActiveBout = useCallback(
    (bout: Bout) => {
      if (!series?.boutUuids.some((uuid: string) => bout.uuid == uuid)) {
        throw new Error("Invalid Bout selected: " + bout.uuid);
      }
      setActiveBout(bout);
    },
    [series],
  );

  return [activeBout, handleSetActiveBout, bouts];
}
