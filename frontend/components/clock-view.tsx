import useClock from "@/hooks/use-clock";
import { useSyncDataContext } from "@/hooks/use-sync-context";
import defaultTimeStringFormatter from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";
import { useMemo } from "react";

export interface ClockProps extends TextProps {
  /**
   * The timestamp at which this Clock was started or `null` if it isn't
   * running.
   */
  startTimestamp?: string | null;
  /**
   * The timestamp at which this Clock was stopped or `null` if it is running.
   */
  stopTimestamp?: string | null;
  /**
   * The number of milliseconds that have elapsed on this clock already.
   */
  elapsed?: number;
  /**
   * The number of milliseconds on this Clock's alarm. Setting this parameter to
   * a number turns this Clock into a count-down.
   */
  alarm?: number;
  /**
   * True to freeze the clock at it current time.
   */
  freeze?: boolean;
  /**
   * An optional function to override the text of the component.
   *
   * If the value returned by the function is a string, this value will be
   * displayed instead of the time.
   *
   * @param milliseconds the number of milliseconds calculated by the clock view.
   * @returns a value to be displayed.
   */
  textOverride?: (milliseconds: number) => string | undefined;
}

/**
 * A basic Clock component. It can be used to display any of the several clocks
 * that are used in Roller Derby.
 */
export default function ClockView({
  startTimestamp = null,
  stopTimestamp = null,
  elapsed = 0,
  alarm = 0,
  freeze = false,
  textOverride,
  ...props
}: ClockProps) {
  const syncDataContext = useSyncDataContext();
  const milliseconds = useClock(
    { startTimestamp, stopTimestamp, elapsed, alarm },
    { serverOffset: syncDataContext?.offset, freeze },
  );

  const value: string = useMemo(
    () =>
      textOverride?.(milliseconds) ?? defaultTimeStringFormatter(milliseconds),
    [milliseconds, textOverride],
  );

  return <Text {...props}>{value}</Text>;
}
