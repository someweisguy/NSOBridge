import { useLatestTimeoutIndex } from "@/hooks/use-bout";
import { useRoster } from "@/hooks/use-roster";
import { useRuleset } from "@/hooks/use-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";
import TimeoutBar from "../../components/timeout-bar";

interface TeamsViewProps {
  bout: Bout;
  team: Team;
}

export default function TeamView({ bout, team }: TeamsViewProps) {
  const { data: roster } = useRoster(team.rosterId);
  const { data: activeTimeout } = useTimeout(bout, useLatestTimeoutIndex(bout));
  const { data: ruleset } = useRuleset(bout.seriesId, team.boutId);

  return (
    <Stack>
      <Center>
        <Title order={1} size={56}>
          <b>{roster.name}</b>
        </Title>
      </Center>
      <Group justify="center">
        <TimeoutBar
          team={team}
          activeTimeout={activeTimeout}
          ruleset={ruleset}
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
