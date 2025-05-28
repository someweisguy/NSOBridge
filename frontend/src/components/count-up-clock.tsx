import { BoutIdContext } from "@/app/provider";
import useBout, { selectClock, selectTimeoutTimer } from "@/hooks/use-bout";
import useElapsed from "@/hooks/use-elapsed";
import { Bout, Timer } from "@/lib/client/api/types";
import formatMilliseconds from "@/utils/format-milliseconds";
import { ReactNode, useContext } from "react";

interface ClockProps {
  boutId?: string;
  name: keyof Bout["timer"]["clocks"] | "timeout";
}

export default function CountUpClock({ boutId, name }: ClockProps): ReactNode {
  const [contextBoutId] = useContext(BoutIdContext);
  boutId ??= contextBoutId;

  const selector = name === "timeout" ? selectTimeoutTimer() : selectClock(name);
  const clock: Timer = useBout(boutId, selector);

  const elapsed: number = useElapsed(clock);

  const timeString: string = formatMilliseconds(elapsed, {
    displayMillis: false,
  });

  return <>{timeString}</>;
}
