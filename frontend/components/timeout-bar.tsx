import { RulesetContext } from "@/lib/game/bouts";
import { Team, Timeout } from "@/types/game";
import { Card, Center, Divider } from "@mantine/core";
import TimeoutPip from "./timeout-pip";

interface TimeoutBarProps {
  team: Team;
  activeTimeout?: Timeout | null;
  ruleset: RulesetContext;
  size: number;
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
