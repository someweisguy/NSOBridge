import GenericTimeoutBar from "@/components/generic-timeout-bar";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { timeoutQueryOptions } from "@/hooks/use-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { TeamContext } from "@/utils/contexts";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

interface TeamsViewProps {
  bout: Bout;
}

export default function TeamView({ bout }: TeamsViewProps) {
  const team: Team | null = useContext(TeamContext);
  if (team == null) {
    throw new Error("TeamView must be used within a TeamProvider");
  }
  const { data: ruleset } = useSuspenseRuleset(bout);

  const { data: timeout } = useQuery<Timeout>({
    ...timeoutQueryOptions(bout, bout.timeoutCount - 1),
    enabled: bout.timeoutCount > 0,
    placeholderData: undefined,
  });

  return (
    <Stack>
      <Center>
        <Title order={1} size={56}>
          <b>{team.name}</b>
        </Title>
      </Center>
      <Group justify="center">
        <GenericTimeoutBar
          numTimeouts={ruleset.numTimeouts}
          timeoutsRemaining={team.timeoutsRemaining}
          numReviews={ruleset.numReviews}
          reviewsRemaining={team.reviewsRemaining}
          timeoutIsActive={
            (timeout?.isRunning() && timeout?.teamNum == team.num) ?? false
          }
          isReview={timeout?.isReview ?? false}
          size={30}
        />

        <Grid>
          <Center w={200}>
            <Text size="72pt">
              <b>{team.boutScore + team.scoreOffset}</b>
            </Text>
          </Center>
          <Center>
            <Text size="30pt">{team.jamScore}</Text>
          </Center>
        </Grid>
      </Group>
    </Stack>
  );
}
