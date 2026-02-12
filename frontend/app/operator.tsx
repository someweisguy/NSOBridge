import BoutProvider from "@/components/bout-provider";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import JamProvider from "@/components/jam-provider";
import PeriodClock from "@/components/period-clock";
import TeamJamProvider from "@/components/team-jam-provider";
import TeamProvider from "@/components/team-provider";
import BoutControlButtons from "@/features/bout-control/bout-control-buttons";
import BoutIntermissionLabel from "@/features/bout/components/intermission-label";
import { BoutStatusLabel } from "@/features/bout/components/status-label";
import TeamJamView from "@/features/team-jam/team-jam-view";
import TeamBoutScore from "@/features/team/components/bout-score";
import TeamJamScore from "@/features/team/components/jam-score";
import TeamName from "@/features/team/components/team-name";
import TeamTimeoutBar from "@/features/team/components/timeout-bar";
import { useSuspenseBout } from "@/hooks/use-bout";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { Team } from "@/lib/game/bouts";
import { Center, Flex, Group, SimpleGrid, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense } from "react";

export default function Operator({ boutUuid }: { boutUuid: string }) {
  usePrefetchServerTime();

  const { data: bout } = useSuspenseBout(boutUuid);
  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();
  const [latestPeriodNum, latestJamNum] = bout.getLatestJamNum();

  return (
    <BoutProvider bout={bout}>
      <Stack align="stretch" justify="flex-start">
        {/* Bout State control */}
        <BoutControlButtons bout={bout} />

        {/* Team information */}
        <SimpleGrid cols={bout.teams.length}>
          {bout.teams.map((team: Team, i: number) => (
            <TeamProvider key={i} team={team}>
              <Stack justify="center">
                <TeamName ta="center" fw="bolder" size="36pt" />
                <Flex
                  direction={i % 2 ? "row-reverse" : "row"}
                  align="center"
                  justify="center"
                  gap="md"
                >
                  <TeamTimeoutBar size={24} />
                  <TeamBoutScore fw="bold" w={150} ta="center" size="48pt" />
                  <TeamJamScore
                    ta={i % 2 ? "right" : "left"}
                    size="24pt"
                    w={50}
                  />
                </Flex>
              </Stack>
            </TeamProvider>
          ))}
        </SimpleGrid>

        {/* Bout State View */}
        <Stack fz="36pt" ta="center" align="stretch">
          <Center>
            {bout.state == "stopped" ? (
              <BoutIntermissionLabel inherit size="36pt" />
            ) : (
              <Group grow justify="center" w="75%" ta="center">
                <PeriodClock inherit />
                <JamNumber inherit />
                <JamClock inherit />
              </Group>
            )}
          </Center>
          <BoutStatusLabel withClock inherit fz="24pt" />
        </Stack>

        {/* TeamJam score editors */}
        <Suspense fallback={"Loading..."}>
          <JamProvider
            bout={bout}
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
          >
            <SimpleGrid cols={bout.teams.length}>
              {bout.teams.map((team: Team, i: number) => (
                <TeamJamProvider key={i} team={team}>
                  <TeamJamView bout={bout} team={team} />
                </TeamJamProvider>
              ))}
            </SimpleGrid>
          </JamProvider>
        </Suspense>

        {/* Lineup editors */}
        <Suspense>
          <JamProvider
            bout={bout}
            periodNum={latestPeriodNum}
            jamNum={latestJamNum}
          >
            {/* TODO */}
          </JamProvider>
        </Suspense>
      </Stack>
    </BoutProvider>
  );
}
