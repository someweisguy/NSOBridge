import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import JamProvider from "@/components/jam-provider";
import PeriodClock from "@/components/period-clock";
import TimeoutProvider from "@/components/timeout-provider";
import BoutProvider from "@/features/bouts/components/bout-provider";
import BoutIntermissionLabel from "@/features/bouts/components/intermission-label";
import JamControl from "@/features/bouts/components/jam-control";
import PeriodControl from "@/features/bouts/components/period-control";
import { BoutStatusLabel } from "@/features/bouts/components/status-label";
import TimeoutControl from "@/features/bouts/components/timeout-control";
import TeamJamJammerState from "@/features/jams/components/jammer-state";
import TeamJamPassEditor from "@/features/jams/components/pass-editor";
import TeamJamProvider from "@/features/jams/components/team-jam-provider";
import TeamJamTripHistory from "@/features/jams/components/trip-history";
import TeamBoutScore from "@/features/teams/components/bout-score";
import TeamJamScore from "@/features/teams/components/jam-score";
import TeamName from "@/features/teams/components/team-name";
import TeamProvider from "@/features/teams/components/team-provider";
import TeamTimeoutBar from "@/features/teams/components/timeout-bar";
import TimeoutCallingTeamEditor from "@/features/timeouts/components/calling-team-editor";
import TimeoutTypeEditor from "@/features/timeouts/components/type-editor";
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
          <BoutStatusLabel withClock inherit fz="24pt" mih="50" />
        </Stack>

        {/* Bout State control */}
        <Group justify="center" mih="75">
          <JamControl />
          <TimeoutControl />
          <PeriodControl />
          {bout.state == "timeout" && (
            <Suspense>
              <TimeoutProvider bout={bout} timeoutNum={bout.timeoutCount - 1}>
                <TimeoutTypeEditor />
                <TimeoutCallingTeamEditor />
              </TimeoutProvider>
            </Suspense>
          )}
          {bout.state == "lineup" && bout.jamCounts[activePeriodNum] > 1 && (
            <JamProvider
              bout={bout}
              periodNum={activePeriodNum}
              jamNum={activeJamNum}
            >
              {/* TODO: call reason controls */}
            </JamProvider>
          )}
        </Group>

        {/* TeamJam score editors */}
        <Suspense fallback={"Loading..."}>
          <JamProvider
            bout={bout}
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
          >
            <SimpleGrid cols={bout.teams.length}>
              {[...Array(2).keys()].map((i: number) => (
                <TeamJamProvider key={i} teamJamNum={i}>
                  <Stack>
                    <TeamJamJammerState />
                    <TeamJamPassEditor />
                    <TeamJamTripHistory />
                  </Stack>
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
