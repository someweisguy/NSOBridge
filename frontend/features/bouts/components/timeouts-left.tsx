import { Box, Card, CardProps } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface TimeoutsLeftProps extends Omit<
  CardProps,
  "size" | "p" | "px" | "py"
> {
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
  /**
   * The width of the timeout bar.
   */
  size: number;
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
  size,
  ...props
}: TimeoutsLeftProps) {
  return (
    <Box>
      <Card withBorder w="fit-content" px={size / 8} {...props}>
        <Card.Section inheritPadding withBorder py={size / 8}>
          {Array.from({ length: numTimeouts }, (_, i) => (
            <Box key={i}>
              <IconCircleFilled
                className={twMerge(
                  i >= timeoutsRemaining && "invisible",
                  i == timeoutsRemaining - 1 &&
                    timeoutIsActive &&
                    !isReview &&
                    "animate-blink",
                )}
                size={size}
              />
            </Box>
          ))}
        </Card.Section>
        <Card.Section inheritPadding py={size / 8}>
          {Array.from({ length: numReviews }, (_, i) => (
            <Box key={i}>
              <IconCircleFilled
                className={twMerge(
                  i >= reviewsRemaining && "invisible",
                  i == reviewsRemaining - 1 &&
                    timeoutIsActive &&
                    isReview &&
                    "animate-blink",
                )}
                size={size}
              />
            </Box>
          ))}
        </Card.Section>
      </Card>
    </Box>
  );
}
