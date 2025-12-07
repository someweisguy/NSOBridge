import useBout from "@/hooks/use-bout";
import useRoster from "@/hooks/use-roster";
import useRuleset from "@/hooks/use-ruleset";
import useTimeout from "@/hooks/use-timeout";
import { Team } from "@/types/game";
import { Center, Grid, Group, Stack, Text, Title } from "@mantine/core";
import TimeoutBar from "../../components/timeout-bar";

interface TeamsViewProps {
  team: Team;
}

export default function TeamView({ team }: TeamsViewProps) {
  const bout = useBout(team.boutId);
  const roster = useRoster(team.rosterId);
  const activeTimeout = useTimeout(team.boutId, bout.numTimeouts - 1);
  const ruleset = useRuleset(team.boutId);

  return (
    <Stack w="full">
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
