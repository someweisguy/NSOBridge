import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import useElapsed from "@/hooks/use-elapsed";
import { Bout, Alarm } from "@/lib/client/api/bout";
import formatMilliseconds from "@/utils/format-milliseconds";
import { ReactNode, useContext } from "react";

interface ClockProps {
  boutId?: string;
  name: Exclude<keyof Bout["timer"]["clocks"], "timeout">;
  showMillis?: boolean | "auto";
}

export default function Clock({
  boutId,
  name,
  showMillis = "auto",
}: ClockProps): ReactNode {
  const [contextBoutId] = useContext(BoutIdContext);
  boutId ??= contextBoutId;

  const clock: Alarm = useBout(boutId).timer.clocks[name];

  const elapsed: number = useElapsed(clock, { stopMillis: clock.alarm + 1500 });

  const remaining = clock.alarm - elapsed;
  const timeToDisplay = remaining >= 0 ? remaining : 0;

  const timeString: string = formatMilliseconds(timeToDisplay, {
    displayMillis:
      showMillis === true ||
      (showMillis === "auto" && remaining < 10000 && remaining > -1000),
  });

  return <>{timeString}</>;
}
