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
): (bout: Bout) => [number, number] {
  return (bout: Bout) => {
    const periodNum = bout.numJams.length - 1;
    const jamNum = bout.numJams[periodNum] - 1;
    return offsetJamId(bout, [periodNum, jamNum], offset)!;
  };
}

export function selectActiveJamId(
  offset = 0,
): (bout: Bout) => [number, number] | null {
  return (bout: Bout) => {
    if (
      bout.clocks.jam.startTimestamp === null &&
      bout.clocks.lineup.startTimestamp === null
    ) {
      return null;
    }

    if (bout.clocks.lineup.startTimestamp !== null) {
      --offset;
    }
    return selectLatestJamId(offset)(bout);
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
        bout.clocks[clockName as keyof Bout["clocks"]].startTimestamp !== null
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
