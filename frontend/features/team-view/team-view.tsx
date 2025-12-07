import useBout from "@/hooks/use-bout";
import useRoster from "@/hooks/use-roster";
import useRuleset from "@/hooks/use-ruleset";
import useTimeout from "@/hooks/use-timeout";
import { Team } from "@/types/game";
import { Center, Grid, Stack, Title } from "@mantine/core";
import JammerStatus from "../../components/jammer-status";
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
    <Stack>
      <Center>
        <Title order={2} size={48}>
          <b>{roster.name}</b>
        </Title>
      </Center>
      <Grid columns={3} justify="center" align="center">
        <Grid.Col span="auto">
          <TimeoutBar
            team={team}
            activeTimeout={activeTimeout}
            ruleset={ruleset}
          />
        </Grid.Col>
        <Grid.Col span="auto">
          <Grid columns={2} justify="center" align="center">
            <Grid.Col span={1}>
              <Title order={1} size={64}>
                <b>{team.boutScore + team.scoreOffset}</b>
              </Title>
            </Grid.Col>
            <Grid.Col span={1}>
              <Title order={1} size={30}>
                {team.jamScore}
              </Title>
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col span="auto">
          <JammerStatus lead={false} lost={false} starPass={false} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
