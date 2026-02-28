import AppProvider from "@/components/app-provider";
import BoutSecondaryStatusContainer from "@/features/bouts/components/bout-secondary-status-container";
import BoutStatus from "@/features/bouts/components/bout-status";
import TeamBoutScore from "@/features/bouts/components/team-bout-score";
import TeamJamScore from "@/features/bouts/components/team-jam-score";
import JamNumber from "@/features/jams/components/jam-number";
import JamStatusContainer from "@/features/jams/components/jam-status-container";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetSyncData } from "@/hooks/use-suspense-get-sync-data";
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

  const { data: syncData } = useSuspenseGetSyncData();

  const { data: bout } = useSuspenseBout(boutUuid);
  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();

  // Prefetch latest Jam to avoid UI blinking
  // TODO: Remove this line when implementing Lineup Editors
  void useJam(bout.uuid, ...bout.getLatestJamNum());

  return (
    <Stack align="stretch" justify="flex-start">
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Stack key={i} justify="center">
            <Text ta="center" fw="bolder" size="36pt">
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
                timeoutCount={bout.timeoutCount}
                {...team}
                size={24}
              />
              <TeamBoutScore
                {...team}
                fw="bold"
                w={150}
                ta="center"
                size="48pt"
              />
              <TeamJamScore
                {...team}
                ta={i % 2 ? "right" : "left"}
                size="24pt"
                w={50}
              />
            </Flex>
          </Stack>
        ))}
      </SimpleGrid>

      {/* Bout State View */}
      <Stack fz="36pt" ta="center" align="stretch">
        <Center>
          <Group grow justify="center" w="75%" ta="center">
            <BoutStatus
              isOvertime={bout.isOvertime()}
              overtimeText="OT"
              serverOffset={syncData.offset}
              {...bout.clock}
              inherit
            />
            <JamNumber
              periodNum={activePeriodNum}
              jamNum={activeJamNum}
              inherit
            />
            <JamStatusContainer
              boutUuid={bout.uuid}
              periodNum={activePeriodNum}
              jamNum={activeJamNum}
              serverOffset={syncData.offset}
              inherit
            />
          </Group>
        </Center>
        <BoutSecondaryStatusContainer
          {...bout}
          className={twMerge(bout.state == "jam" && "invisible")}
          serverOffset={syncData.offset}
          inherit
          fz="24pt"
        />
      </Stack>
    </Stack>
  );
}
