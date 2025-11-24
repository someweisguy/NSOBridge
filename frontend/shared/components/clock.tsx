import useClock from "@/shared/features/game/clocks/hooks/use-clock";
import { useEffect, useState } from "react";

function formatMilliseconds(
  millis: number,
  showTenths: boolean,
  sign = "+",
): string {
  const isNegative = millis < 0;
  millis = Math.abs(millis);
  let m = String(Math.floor((millis % 3600000) / 60000));
  let s = String(Math.floor((millis / 1000) % 60));

  let output: string;
  if (millis >= 3600000) {
    const h = Math.floor(millis / 3600000);
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");
    output = `${h}:${m}:${s}`;
  } else if (millis >= 60000) {
    s = String(s).padStart(2, "0");
    output = `${m}:${s}`;
  } else {
    output = s;
  }

  // Render tenths of a seconds
  if (showTenths) {
    const ds = String(Math.floor((millis % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  // Render a negative sign if the format string is not zero
  if (isNegative && ((showTenths && millis >= 100) || millis >= 1000)) {
    output = sign + output;
  }

  return output;
}

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
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
  const showTenths =
    alarm != null && clockMillis < 10000 && clockMillis > -2000;
  return (
    <label className="tabular-nums">
      {formatMilliseconds(displayMillis, showTenths)}
    </label>
  );
}
