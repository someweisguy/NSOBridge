import { Card, Center, Divider } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  activeType?: "timeout" | "review";
  numTimeouts: number;
  timeoutsRemaining: number;
  numReviews: number;
  reviewsRemaining: number;
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
  activeType,
  timeoutsRemaining,
  reviewsRemaining,
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
              active={i == timeoutsRemaining - 1 && activeType == "timeout"}
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
              active={i == reviewsRemaining - 1 && activeType == "review"}
            />
          </Center>
        </Card.Section>
      ))}
    </Card>
  );
}
