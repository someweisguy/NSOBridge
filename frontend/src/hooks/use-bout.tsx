import { getBout, offsetJamId } from "@/lib/client/api/bout";
import { Bout } from "@/lib/client/api/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

type ClockNameString = keyof Bout["timer"]["clocks"] | "timeout";

export default function useBout<T = Bout>(
  boutId: string,
  select?: (data: Bout) => T
): T {
  const { data } = useSuspenseQuery({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => getBout(boutId),
    select,
  });

  return data;
}

export function selectLatestJamId(
  offset = 0,
  returnOutOfBounds = false
): (bout: Bout) => [number, number] {
  return (bout: Bout) => {
    const numJams: [number, number] = bout.numJams;
    const periodNum = Number(numJams[1] > 0);
    const jamNum = numJams[periodNum] - 1;
    return offsetJamId(bout, [periodNum, jamNum], offset, returnOutOfBounds)!;
  };
}

export function selectActiveJamId(
  offset = 0,
  returnOutOfBounds = false
): (bout: Bout) => [number, number] | null {
  return (bout: Bout) => {
    const latestJamId: [number, number] = selectLatestJamId()(bout);

    // Turn the Jam vector into a scalar
    let jamScalar: number = latestJamId[1] + latestJamId[0] * bout.numJams[0];

    // Apply an offset and subtract one if the Jam timer isn't running
    jamScalar += offset - Number(bout.timer.clocks.jam.startTimestamp === null);

    // Convert the Jam scalar back into a vector
    const periodNum = Number(jamScalar > bout.numJams[0]);
    const jamNum = jamScalar - periodNum * bout.numJams[0];
    const jamVector: [number, number] = [periodNum, jamNum];

    // Validate that the new Jam vector is within bounds
    if (
      !returnOutOfBounds &&
      (jamScalar < 0 || jamScalar >= bout.numJams[0] + bout.numJams[1])
    ) {
      return null;
    }
    return jamVector;
  };
}

export function selectClockIsRunning(
  clockName: ClockNameString
): (bout: Bout) => boolean {
  return (bout: Bout) => {
    if (clockName in bout.timer.clocks) {
      return (
        bout.timer.clocks[clockName as keyof Bout["timer"]["clocks"]]
          .startTimestamp !== null
      );
    } else {
      const numTimeouts = bout.timer.timeouts.length;
      return (
        numTimeouts > 0 && bout.timer.timeouts[numTimeouts - 1].elapsed === null
      );
    }
  };
}
