import { useSyncDataContext } from "@/hooks/use-sync-context";
import defaultTimeStringFormatter, {
  jamTimeStringFormatter,
  lineupTimeStringFormatter,
  periodTimeStringFormatter,
  timeoutTimeStringFormatter,
  timeToDerbyStringFormatter,
} from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";
import { useEffect, useState } from "react";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

const timeFormatters = {
  bout: periodTimeStringFormatter,
  jam: jamTimeStringFormatter,
  lineup: lineupTimeStringFormatter,
  timeout: timeoutTimeStringFormatter,
  timeToDerby: timeToDerbyStringFormatter,
  default: defaultTimeStringFormatter,
};

export interface ClockProps extends TextProps {
  /**
   * The timestamp at which this Clock was started or `null` if it isn't running.
   */
  startTimestamp: string | null;
  /**
   * The timestamp at which this Clock was stopped or `null` if it is running.
   */
  stopTimestamp?: string | null;
  /**
   * The number of milliseconds that have elapsed on this clock already.
   */
  elapsed?: number;
  /**
   * The number of milliseconds on this Clock's alarm. Setting this parameter to a
   * number turns this Clock into a count-down.
   */
  alarm?: number;
  /**
   * The difference in milliseconds between the host and the server. Allows for visual
   * synchronization between multiple clients. This value is automatically provided when
   * used inside a ServerOffsetContext.
   */
  serverOffset?: number;
  /**
   * True to freeze the clock at it current time.
   */
  freeze?: boolean;
  /**
   * The format to use when formatting this Clock.
   */
  formatter?: keyof typeof timeFormatters;
}

/**
 * A basic Clock component. It can be used to display any of the several clocks
 * that are used in Roller Derby.
 */
export default function ClockView({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  serverOffset,
  freeze = false,
  formatter = "default",
  ...props
}: ClockProps) {
  const [value, setValue] = useState("");
  const syncDataContext = useSyncDataContext();

  useEffect(() => {
    if (freeze || startTimestamp == null) {
      return; // Clock is stopped
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      let milliseconds = elapsed;
      const startMilliseconds = new Date(startTimestamp).getTime();
      if (startTimestamp != null && stopTimestamp == null) {
        // Clock is running
        milliseconds += now.getTime() - startMilliseconds;
      } else if (startTimestamp != null && stopTimestamp != null) {
        // Clock is stopped; add difference between timestamps
        milliseconds += new Date(stopTimestamp).getTime() - startMilliseconds;
      }

      if (startTimestamp != null) {
        // Add the server offset only if the clock is running
        milliseconds += serverOffset ?? syncDataContext?.offset ?? 0;
      }

      const formattedValue = timeFormatters[formatter](milliseconds);
      setValue(formattedValue);
    }, CLOCK_REFRESH_RATE);
    return () => clearInterval(intervalId);
  }, [
    startTimestamp,
    stopTimestamp,
    elapsed,
    alarm,
    freeze,
    formatter,
    serverOffset,
    syncDataContext,
  ]);

  return <Text {...props}>{value}</Text>;
}
