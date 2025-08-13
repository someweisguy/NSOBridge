import useServerClock from "@/hooks/use-server-clock";

interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  formatter?: (millis: number, displayMillis: boolean) => string;
}

function formatMilliseconds(millis: number, displayMillis: boolean): string {
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
  if (displayMillis) {
    const ds = String(Math.floor((millis % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  // Render a negative sign if the format string is not zero
  if (isNegative && ((displayMillis && millis >= 100) || millis >= 1000)) {
    output = "-" + output;
  }

  return output;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  formatter = formatMilliseconds,
}: ClockProps) {
  const clockMillis = useServerClock(
    startTimestamp,
    stopTimestamp,
    elapsed,
    alarm
  );

  return <>{formatter(clockMillis, clockMillis < 1000 * 10)}</>;
}
