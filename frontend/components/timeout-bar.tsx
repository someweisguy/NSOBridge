import { Team } from "@/lib/game/bouts";
import { Ruleset } from "@/lib/game/ruleset";
import { Timeout } from "@/lib/game/timeouts";
import { Card, Center, Divider } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  team: Team;
  activeTimeout?: Timeout | null;
  ruleset: Ruleset;
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
  team,
  activeTimeout,
  ruleset,
  size = 30,
}: TimeoutBarProps) {
  if (!activeTimeout?.isRunning()) {
    // There is no active Timeout
    activeTimeout = null;
  }

  return (
    <Card withBorder w={size} radius="md">
      {Array.from({ length: ruleset.numTimeouts }, (_, i) => (
        <Card.Section key={i}>
          <Center>
            <TimeoutPip
              size={size}
              invisible={i >= team.timeoutsRemaining}
              active={
                i == team.timeoutsRemaining - 1 &&
                activeTimeout?.teamId == team.id &&
                !activeTimeout?.isReview
              }
            />
          </Center>
        </Card.Section>
      ))}
      <Card.Section>
        <Divider mx={4} my={2} />
      </Card.Section>
      {Array.from({ length: ruleset.numReviews }, (_, i) => (
        <Card.Section key={i}>
          <Center>
            <TimeoutPip
              size={size}
              invisible={i >= team.reviewsRemaining}
              active={
                i == team.reviewsRemaining - 1 &&
                activeTimeout?.teamId == team.id &&
                activeTimeout?.isReview
              }
            />
          </Center>
        </Card.Section>
      ))}
    </Card>
  );
}
