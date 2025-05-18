import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import useElapsed from "@/hooks/use-elapsed";
import { Bout, ClockType } from "@/lib/client/api/bout";
import formatMilliseconds from "@/utils/format-milliseconds";
import { ReactNode, useContext } from "react";

interface ClockProps {
  boutId?: string;
  name: Exclude<keyof Bout["timer"]["clocks"], "timeout">;
}

export default function Clock({ boutId, name }: ClockProps): ReactNode {
  const [contextBoutId] = useContext(BoutIdContext);
  boutId = boutId ?? contextBoutId;

  const clock: ClockType = useBout(boutId).timer.clocks[name];

  const elapsed: number = useElapsed(clock, { stopMillis: clock.alarm + 1500 });

  const remaining = clock.alarm - elapsed;
  const timeToDisplay = remaining >= 0 ? remaining : 0;

  const timeString: string = formatMilliseconds(timeToDisplay, {
    displayMillis: remaining < 10000 && remaining > -1000,
  });

  return <>{timeString}</>;
}
