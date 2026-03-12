import AppProvider from "@/components/app-provider";
import BoutClockContainer from "@/features/bouts/components/bout-clock-container";
import StatusClockContainer from "@/features/bouts/components/bout-status-container";
import JamNumber from "@/features/jams/components/jam-number";
import JamStatusContainer from "@/features/jams/components/jam-status-container";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { Team } from "@/lib/game/bouts";
import { BoutUuidContext } from "@/utils/contexts";
import FitScreen from "@fit-screen/react";
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { useContext } from "react";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
import "./global.css";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(
  <AppProvider>
    <FitScreen waitTime={25} mode="fit">
      <Scoreboard />
    </FitScreen>
  </AppProvider>,
);

export function Scoreboard() {
  const boutUuid: string | null = useContext(BoutUuidContext);
  if (boutUuid == null) {
    throw new Error(
      "Operator page must be used within a BoutUuidContext provider",
    );
  }

  const { data: bout } = useSuspenseBout({ boutUuid });

  const activeJamUri = bout.getActiveJamUri() ?? bout.getLatestJamUri();
  const latestTimeoutUri = bout.getLatestTimeoutUri();

  // Prefetch latest Jam to avoid UI blinking
  // TODO: Remove this line when implementing Lineup Editors
  void useJam({ ...bout.getLatestJamUri() });

  return (
    <Stack align="stretch" justify="flex-start">
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Stack key={i} justify="center">
            <Text ta="center" fw="bolder" size="64pt">
              {team.name}
            </Text>
            <Flex
              direction={i % 2 ? "row-reverse" : "row"}
              align="center"
              justify="center"
              gap="md"
            >
              <TimeoutsLeftContainer
                teamNum={team.num}
                {...latestTimeoutUri}
                {...team}
                size={36}
              />
              <Text fw="bold" w={150} ta="center" size="48pt">
                {team.boutScore + team.scoreOffset}
              </Text>
              <Text ta={i % 2 ? "right" : "left"} size="24pt" w={50}>
                {team.jamScore}
              </Text>
            </Flex>
          </Stack>
        ))}
      </SimpleGrid>

      {/* Bout State View */}
      <Stack fz="72pt" ta="center" align="stretch">
        <Center>
          <Group grow justify="center" w="75%" ta="center">
            <BoutClockContainer boutUuid={bout.uuid} inherit />
            <JamNumber {...activeJamUri} inherit />
            <JamStatusContainer {...activeJamUri} inherit />
          </Group>
        </Center>
        <StatusClockContainer
          boutUuid={bout.uuid}
          className={twMerge(bout.state == "jam" && "invisible")}
          inherit
          fz="48pt"
        />
      </Stack>
    </Stack>
  );
}
