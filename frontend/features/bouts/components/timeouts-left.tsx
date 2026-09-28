import { Divider, Paper, PaperProps, px, Stack } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface TimeoutsLeftProps extends PaperProps {
  /**
   * The total permitted number of Timeouts allowed per the ruleset.
   */
  numTimeouts: number;
  /**
   * The number of Timeouts that the team has remaining.
   */
  timeoutsRemaining: number;
  /**
   * The total permitted number of Official Reviews allowed per the ruleset.
   */
  numReviews: number;
  /**
   * The number of Official Reviews that the team has remaining.
   */
  reviewsRemaining: number;
  /**
   * True if this Team has a timeout currently in progress.
   */
  timeoutIsActive: boolean;
  /**
   * True if the the Timeout that is currently in progress is an Official Review. This
   * argument is ignored if `timeoutIsActive` is false.
   */
  isReview: boolean;
}

/**
 * Displays the number of Timeouts and Official Reviews that a Team has remaining. This
 * component also shows if a Team's Timeout or Official Review is in progress.
 */
export default function TimeoutsLeft({
  numTimeouts,
  numReviews,
  timeoutsRemaining,
  reviewsRemaining,
  timeoutIsActive,
  isReview,
  h,
  ...props
}: TimeoutsLeftProps) {
  const size = useMemo(
    () => Number(px(h)) / (numTimeouts + numReviews),
    [h, numTimeouts, numReviews],
  );
  const margin = useMemo(() => size / 8, [size]);

  return (
    <Paper withBorder {...props}>
      <Stack justify="space-around" align="center" gap="0" m={margin}>
        {Array.from({ length: numTimeouts }, (_, i) => (
          <IconCircleFilled
            key={i}
            className={twMerge(
              i >= timeoutsRemaining && "invisible",
              i == timeoutsRemaining - 1 &&
                timeoutIsActive &&
                !isReview &&
                "animate-blink",
            )}
            size={size}
          />
        ))}
      </Stack>
      <Divider w="100%" />
      <Stack justify="space-around" align="center" gap="0" m={margin}>
        {Array.from({ length: numReviews }, (_, i) => (
          <IconCircleFilled
            key={i}
            className={twMerge(
              i >= reviewsRemaining && "invisible",
              i == reviewsRemaining - 1 &&
                timeoutIsActive &&
                isReview &&
                "animate-blink",
            )}
            size={size}
          />
        ))}
      </Stack>
    </Paper>
  );
}
