import TimeoutBar from "@/components/timeout-bar";
import { Bout, Team } from "@/lib/game/bouts";
import { Ruleset } from "@/lib/game/ruleset";
import { Timeout } from "@/lib/game/timeouts";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";

interface TeamsViewProps {
  bout: Bout;
  team: Team;
  timeout: Timeout;
  ruleset: Ruleset;
}

export default function TeamView({ team, timeout, ruleset }: TeamsViewProps) {
  return (
    <Stack>
      <Center>
        <Title order={1} size={56}>
          <b>{team.name}</b>
        </Title>
      </Center>
      <Group justify="center">
        <TimeoutBar
          team={team}
          activeTimeout={timeout}
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
