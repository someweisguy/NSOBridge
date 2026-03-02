import { Card, Center, Divider } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface TimeoutsLeftProps {
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
}: TimeoutsLeftProps) {
  return (
    <Card withBorder w={size} radius="md">
      {Array.from({ length: numTimeouts }, (_, i) => (
        <Card.Section key={i}>
          <Center>
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
          </Center>
        </Card.Section>
      ))}
      <Card.Section>
        <Divider mx={4} my={2} />
      </Card.Section>
      {Array.from({ length: numReviews }, (_, i) => (
        <Card.Section key={i}>
          <Center>
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
          </Center>
        </Card.Section>
      ))}
    </Card>
  );
}
