import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../../../utils/keyFactory";
import dispatch from "../../../app/client";
import { useEffect, useState } from "react";
import { getNextJamId, getPreviousJamId } from "../../../utils/jamId";
import { JamIdType } from "../../../types/jam";
import { BoutIdType, BoutType } from "../../../types/bout";

export default function useJamIterator(
  boutId: BoutIdType
): [JamIdType, (jamId: JamIdType) => void, JamIdType | null, JamIdType | null] {
  // Get the number of Jams in each period
  const { data: numJams } = useSuspenseQuery<
    BoutType,
    unknown,
    [number, number]
  >({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => dispatch("bout", "get", { boutId }),
    select: (data: BoutType) => data.numJams,
  });

  // Set the initial state
  const [jamId, setJamId] = useState<JamIdType>(() => {
    const periodNum: number = Number(numJams[1] > 0);
    const finalJamId: JamIdType = [periodNum, numJams[periodNum] - 1];
    return finalJamId;
  });
  const [previousJamId, setPreviousJamId] = useState<JamIdType | null>(
    getPreviousJamId(numJams, jamId)
  );
  const [nextJamId, setNextJamId] = useState<JamIdType | null>(
    getNextJamId(numJams, jamId)
  );

  useEffect(() => {
    // Update the next and previous Jam Ids
    setPreviousJamId(getPreviousJamId(numJams, jamId));
    setNextJamId(getNextJamId(numJams, jamId));

    // Handle case where the current Jam has been deleted
    const [periodNum, jamNum] = jamId;
    if (jamNum >= numJams[periodNum]) {
      const validJamId = getPreviousJamId(numJams, jamId)!;
      const nextJamId = getNextJamId(numJams, validJamId);
      if (nextJamId != null) {
        setJamId(nextJamId);
      } else {
        setJamId(validJamId);
      }
    }
  }, [jamId, numJams]);

  return [jamId, setJamId, nextJamId, previousJamId];
}
