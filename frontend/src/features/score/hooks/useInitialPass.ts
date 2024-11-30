import { useEffect, useState } from "react";
import { JamIdType } from "../../../types/JamIdType";

export default function useInitialPass(boutId: string, jamId: JamIdType, selectedTrip?: number): boolean {
  const [showInitial,] = useState<boolean>(true);

  useEffect(() => {
    // TODO: change whether the initial pass should be used based on ruleset
  }, [boutId, jamId])

  return selectedTrip != undefined ? selectedTrip == 0 && showInitial : showInitial;
}