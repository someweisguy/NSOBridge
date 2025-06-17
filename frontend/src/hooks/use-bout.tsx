import { getBout, offsetJamId } from "@/lib/client/api/bout";
import { Alarm, Bout, ClockNameString, Timer } from "@/lib/client/api/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

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
    const numJams: [number, number, number] = bout.numJams;
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
    jamScalar += offset - Number(bout.clocks.jam.startTimestamp === null);

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

export function selectClock(clockName: ClockNameString): (bout: Bout) => Alarm {
  return (bout: Bout) => {
    return bout.clocks[clockName];
  };
}

export function selectTimeoutTimer(): (bout: Bout) => Timer {
  return (bout: Bout) => {
    const numTimeouts = bout.timeouts.length;
    if (numTimeouts === 0) {
      return { startTimestamp: null, elapsed: 0 } as Timer;
    }
    return bout.timeouts[numTimeouts - 1];
  };
}

export function selectClockIsRunning(
  clockName: ClockNameString | "timeout"
): (bout: Bout) => boolean {
  return (bout: Bout) => {
    if (clockName in bout.clocks) {
      return (
        bout.clocks[clockName as keyof Bout["clocks"]]
          .startTimestamp !== null
      );
    } else {
      const numTimeouts = bout.timeouts.length;
      return (
        numTimeouts > 0 &&
        bout.timeouts[numTimeouts - 1].startTimestamp !== null
      );
    }
  };
}
