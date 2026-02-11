import { Card, Center, Divider } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface GenericTimeoutBarProps {
  numTimeouts: number;
  timeoutsRemaining: number;
  numReviews: number;
  reviewsRemaining: number;
  timeoutIsActive: boolean;
  isReview: boolean;
  size: number;
}

export default function GenericTimeoutBar({
  numTimeouts,
  numReviews,
  timeoutsRemaining,
  reviewsRemaining,
  timeoutIsActive,
  isReview,
  size,
}: GenericTimeoutBarProps) {
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
