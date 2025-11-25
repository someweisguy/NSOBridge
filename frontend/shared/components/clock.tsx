import useClock from "@/shared/hooks/use-clock";
import { useEffect, useState } from "react";
import defaultTimeStringFormatter from "../utils/DefaultTimeStringFormatter";

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  formatter: (milliseconds: number) => string;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  formatter = defaultTimeStringFormatter,
}: ClockProps) {
  const [run, setRun] = useState<boolean>(false);
  const [clockMillis] = useClock(
    { startTimestamp, stopTimestamp, elapsed, alarm },
    run,
  );

  // Stop the clock when it when it has elapsed
  useEffect(() => {
    setRun(clockMillis > -2500);
  }, [clockMillis]);

  const displayMillis = clockMillis > 0 ? clockMillis : 0;
  return <label className="tabular-nums">{formatter(displayMillis)}</label>;
}
