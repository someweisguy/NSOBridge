import { useSuspenseQuery } from "@tanstack/react-query";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutType } from "../../../types/BoutType";
import { keyFactory } from "../../../utils/keyFactory";
import dispatch from "../../../app/client";
import { useEffect, useState } from "react";
import { JamIdType } from "../../../types/JamIdType";

function getNextJamId(
  jamCounts: [number, number],
  jamId: JamIdType
): JamIdType | null {
  const [periodNum, jamNum] = jamId;
  let jamScalar: number = jamNum + 1;
  if (periodNum == 1) {
    jamScalar += jamCounts[0];
  }

  const maxScalar: number = jamCounts.reduce((sum, count) => (sum += count), 0);
  if (jamScalar >= maxScalar) {
    return null;
  }

  return [
    Number(jamScalar >= jamCounts[0]),
    jamScalar >= jamCounts[0] ? 0 : jamNum + 1,
  ];
}

function getPreviousJamId(
  jamCounts: [number, number],
  jamId: JamIdType
): JamIdType | null {
  const [periodNum, jamNum] = jamId;
  let jamScalar: number = jamNum - 1;
  if (periodNum == 1) {
    jamScalar += jamCounts[0];
  }

  if (jamScalar < 0) {
    return null;
  }

  return [Number(jamScalar > jamCounts[0]), jamScalar % jamCounts[0]];
}

export default function useJamIterator(
  boutId: BoutIdType
): [
  [number, number],
  (jamId: [number, number]) => void,
  [number, number] | null,
  [number, number] | null
] {
  const { data: numJams } = useSuspenseQuery<
    BoutType,
    unknown,
    [number, number]
  >({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => dispatch("bout", "get", { boutId }),
    select: (data: BoutType) => data.numJams,
  });

  const [jamId, setJamId] = useState<[number, number]>(() => {
    const periodNum: number = Number(numJams[1] > 0);
    return [periodNum, numJams[periodNum] - 1];
  });
  const [previousJamId, setPreviousJamId] = useState<[number, number] | null>(
    getPreviousJamId(numJams, jamId)
  );
  const [nextJamId, setNextJamId] = useState<[number, number] | null>(
    getNextJamId(numJams, jamId)
  );

  useEffect(() => {
    setPreviousJamId(getPreviousJamId(numJams, jamId));
    setNextJamId(getNextJamId(numJams, jamId));
  }, [jamId, numJams]);

  return [jamId, setJamId, nextJamId, previousJamId];
}
