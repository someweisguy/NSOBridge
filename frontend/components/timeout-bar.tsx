import { Card, Center, Divider } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  numTimeouts: number;
  timeoutsRemaining: number;
  numReviews: number;
  reviewsRemaining: number;
  timeoutIsActive: boolean;
  isReview: boolean;
  size: number;
}

interface TimeoutPipProps {
  size: number;
  invisible?: boolean;
  active?: boolean;
}

function TimeoutPip({
  size,
  invisible = false,
  active = false,
}: TimeoutPipProps) {
  return (
    <IconCircleFilled
      className={twMerge(
        "icon icon-tabler icons-tabler-filled icon-tabler-circle",
        invisible && "invisible",
        active && !invisible && "animate-blink",
      )}
      size={size}
    />
  );
}

export default function TimeoutBar({
  numTimeouts,
  numReviews,
  timeoutsRemaining,
  reviewsRemaining,
  timeoutIsActive,
  isReview,
  size = 30,
}: TimeoutBarProps) {
  return (
    <Card withBorder w={size} radius="md">
      {Array.from({ length: numTimeouts }, (_, i) => (
        <Card.Section key={i}>
          <Center>
            <TimeoutPip
              size={size}
              invisible={i >= timeoutsRemaining}
              active={
                i == timeoutsRemaining - 1 && timeoutIsActive && !isReview
              }
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
            <TimeoutPip
              size={size}
              invisible={i >= reviewsRemaining}
              active={i == reviewsRemaining - 1 && timeoutIsActive && isReview}
            />
          </Center>
        </Card.Section>
      ))}
    </Card>
  );
}
