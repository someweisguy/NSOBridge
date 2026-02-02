import TimeoutBar from "@/components/timeout-bar";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useContext } from "react";

interface TeamsViewProps {
  team: Team;
}

export default function TeamView({ team }: TeamsViewProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("TeamView can only be used in a BoutContext");
  }
  const { data: ruleset } = useSuspenseRuleset(bout);

  const {
    data: timeout,
    isPending,
    isError,
  } = useTimeout(bout, bout.timeoutCount - 1);

  return (
    <Stack>
      <Center>
        <Title order={1} size={56}>
          <b>{team.name}</b>
        </Title>
      </Center>
      <Group justify="center">
        <TimeoutBar
          activeType={
            isPending || isError
              ? undefined
              : timeout?.isReview
                ? "review"
                : "timeout"
          }
          numTimeouts={ruleset.numTimeouts}
          timeoutsRemaining={team.timeoutsRemaining}
          numReviews={ruleset.numReviews}
          reviewsRemaining={team.reviewsRemaining}
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
