import BoutClockContainer from "@/features/bouts/components/bout-clock-container";
import StatusClockContainer from "@/features/bouts/components/bout-status-container";
import JamClockContainer from "@/features/jams/components/jam-clock-container";
import JamNumberContainer from "@/features/jams/components/jam-number-container";
import PageContainer from "@/features/page-rendering/components/page-container";
import { useBoutUriContext } from "@/features/page-rendering/hooks/use-bout-uri-context";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { Team } from "@/lib/game/bouts";
import FitScreen from "@fit-screen/react";
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
import "./global.css";

const root: HTMLElement | null = document.getElementById("root");
if (root == null) {
  throw new Error("Root HTML Node was not found.");
}
createRoot(root).render(
  <PageContainer>
    <Scoreboard />
  </PageContainer>,
);

/**
 * Display the audience-facing scoreboard. This has at-a-glance information about the
 * state of the bout as concisely and accessibly as possible.
 */
export function Scoreboard() {
  const boutUri = useBoutUriContext();
  const { data: bout } = useSuspenseBout(boutUri);
  const activeJamUri = bout.getActiveJamUri() ?? bout.getLatestJamUri();

  // Prefetch latest Jam to avoid UI blinking
  // TODO: Remove this line when implementing Lineup Editors
  void useJam({ ...bout.getLatestJamUri() });

  return (
    <FitScreen waitTime={25} mode="fit">
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
                  boutUuid={bout.uuid}
                  teamNum={team.num}
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
              <JamNumberContainer {...activeJamUri} inherit />
              <JamClockContainer {...activeJamUri} inherit />
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
    </FitScreen>
  );
}
