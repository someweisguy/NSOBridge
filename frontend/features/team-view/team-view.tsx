import TimeoutBar from "@/components/timeout-bar";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { timeoutQueryOptions } from "@/hooks/use-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { BoutContext } from "@/utils/contexts";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
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

  const { data: timeout } = useQuery<Timeout>({
    ...timeoutQueryOptions(bout, bout.timeoutCount - 1),
    enabled: bout.timeoutCount > 0,
    placeholderData: undefined,
  });

  const timeoutType: "review" | "timeout" | undefined =
    timeout == undefined || timeout.teamIsOfficials
      ? undefined
      : timeout.isReview
        ? "review"
        : "timeout";

  return (
    <Stack>
      <Center>
        <Title order={1} size={56}>
          <b>{team.name}</b>
        </Title>
      </Center>
      <Group justify="center">
        <TimeoutBar
          activeType={timeoutType}
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
