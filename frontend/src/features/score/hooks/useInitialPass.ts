import { useEffect, useState } from "react";
import { JamId } from "../../../hooks/jam";

export default function useInitialPass(boutId: string, jamId: JamId, selectedTrip?: number): boolean {
  const [showInitial,] = useState<boolean>(true);

  useEffect(() => {
    // TODO: change whether the initial pass should be used based on ruleset
  }, [boutId, jamId])

  return selectedTrip != undefined ? selectedTrip == 0 && showInitial : showInitial;
}