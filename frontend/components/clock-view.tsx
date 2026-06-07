import { useSyncDataContext } from "@/hooks/use-sync-context";
import { Text, TextProps } from "@mantine/core";
import { useEffect, useState } from "react";
import defaultTimeStringFormatter, {
  jamTimeStringFormatter,
  lineupTimeStringFormatter,
  periodTimeStringFormatter,
  timeoutTimeStringFormatter,
} from "../utils/time-string-formatters";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

const timeFormatters = {
  bout: periodTimeStringFormatter,
  jam: jamTimeStringFormatter,
  lineup: lineupTimeStringFormatter,
  timeout: timeoutTimeStringFormatter,
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

  prefix?: string;
}

/**
 * A basic Clock component. It can be used to display any of the several clocks that are
 * used in Roller Derby. This component is completely unstyled. It should be wrapped in
 * a text component or similar before being rendered.
 */
export default function ClockView({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  serverOffset,
  freeze = false,
  formatter = "default",
  prefix,
  ...props
}: ClockProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState(new Date());
  const syncDataContext = useSyncDataContext();

  useEffect(() => {
    if (freeze || startTimestamp == null) {
      return; // Clock is stopped or manually frozen
    }

    setCurrentTimestamp(new Date());
    const intervalId = setInterval(
      () => setCurrentTimestamp(new Date()),
      CLOCK_REFRESH_RATE,
    );
    return () => clearInterval(intervalId);
  }, [startTimestamp, freeze]);

  // Calculate the number of milliseconds that have elapsed since the last update
  let milliseconds = elapsed;
  if (startTimestamp != null && stopTimestamp == null) {
    // Clock is running
    milliseconds +=
      currentTimestamp.getTime() - new Date(startTimestamp).getTime();
  } else if (startTimestamp != null && stopTimestamp != null) {
    // Clock is stopped but add the additional elapsed time to the accumulator
    milliseconds +=
      new Date(stopTimestamp).getTime() - new Date(startTimestamp).getTime();
  }

  if (startTimestamp != null) {
    milliseconds += serverOffset ?? syncDataContext?.offset ?? 0;
  }

  return (
    <Text {...props}>
      {prefix}
      {prefix == null ? "" : " "}
      {timeFormatters[formatter](milliseconds, alarm)}
    </Text>
  );
}
