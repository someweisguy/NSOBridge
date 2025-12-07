import useBout from "@/hooks/use-bout";
import useRoster from "@/hooks/use-roster";
import useRuleset from "@/hooks/use-ruleset";
import useTimeout from "@/hooks/use-timeout";
import { Team } from "@/types/game";
import { Center, SimpleGrid, Stack, Title } from "@mantine/core";
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
    <Stack w="full">
      <Center>
        <Title order={2} size={56}>
          <b>{roster.name}</b>
        </Title>
      </Center>
      <SimpleGrid cols={3}>
        <TimeoutBar
          team={team}
          activeTimeout={activeTimeout}
          ruleset={ruleset}
          size={30}
        />
        <SimpleGrid cols={2} spacing="sm">
          <Center>
            <Title size={72}>
              <b>{team.boutScore + team.scoreOffset}</b>
            </Title>
          </Center>
          <Center>
            <Title size={30}>{team.jamScore}</Title>
          </Center>
        </SimpleGrid>
        <JammerStatus lead={false} lost={false} starPass={false} />
      </SimpleGrid>
    </Stack>
  );
}
