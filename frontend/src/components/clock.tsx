import useServerClock from "@/hooks/use-server-clock";

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
  const clockMillis = useServerClock(
    startTimestamp,
    stopTimestamp,
    elapsed,
    alarm
  );

  return <>{clockMillis}</>;
}
