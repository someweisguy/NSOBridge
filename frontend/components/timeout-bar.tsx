import { RulesetContext } from "@/lib/game/bouts";
import { Team, Timeout } from "@/types/game";
import { Card, Center, Divider } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  team: Team;
  activeTimeout?: Timeout | null;
  ruleset: RulesetContext;
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={twMerge(
        "icon icon-tabler icons-tabler-filled icon-tabler-circle",
        invisible && "invisible",
        active && !invisible && "animate-blink",
      )}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
    </svg>
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
