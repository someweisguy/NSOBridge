import useServerTime from "@/hooks/use-server-time";

export default function useServerClock(
  startTimestamp: Date | null,
  stopTimestamp?: Date | null,
  elapsed = 0,
  alarm?: number
) {
  const serverNow: Date = useServerTime(startTimestamp !== null);
  stopTimestamp ??= serverNow;

  if (startTimestamp !== null) {
    elapsed += stopTimestamp.getTime() - startTimestamp.getTime();
  }

  if (alarm !== undefined) {
    elapsed = alarm - elapsed;
  }

  return elapsed;
}
