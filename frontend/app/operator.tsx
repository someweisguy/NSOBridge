import Clock from "@/components/clock";
import PageShell from "@/components/page-shell";
import BoutClock from "@/features/bouts/components/bout-clock";
import BoutJamControl from "@/features/bouts/components/bout-jam-control";
import BoutPeriodControl from "@/features/bouts/components/bout-period-control";
import BoutStatus from "@/features/bouts/components/bout-status";
import BoutTimeoutControl from "@/features/bouts/components/bout-timeout-control";
import TeamName from "@/features/bouts/components/team-name";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import JamClock from "@/features/jams/components/jam-clock";
import JamNumber from "@/features/jams/components/jam-number";
import JammerStateEditor from "@/features/jams/components/jammer-state-editor";
import PassEditor from "@/features/jams/components/pass-editor";
import JamStopReasonEditor from "@/features/jams/components/stop-reason-editor";
import TeamJamTripHistory from "@/features/jams/components/team-jam-trip-history";
import TimeoutCallerEditor from "@/features/timeouts/components/timeout-caller-editor";
import TimeoutRetainedEditor from "@/features/timeouts/components/timeout-retained-editor";
import TimeoutTypeEditor from "@/features/timeouts/components/timeout-type-editor";
import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { redo, undo } from "@/lib/history";
import { Team } from "@/types/bout";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import {
  Card,
  Center,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense, useState } from "react";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
import "./global.css";
import AppProvider from "./provider";

// Register Ctrl+Z and Ctrl+Y as undo and redo respectively
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key.toLowerCase() === "z") {
      event.preventDefault();
      void undo();
    }
    if (event.key.toLowerCase() === "y") {
      event.preventDefault();
      void redo();
    }
  }
});

const root: HTMLElement | null = document.getElementById("root");
if (root != null) {
  document.title = "NSO Bridge";
  createRoot(root).render(
    <AppProvider>
      <Operator />
    </AppProvider>,
  );
}

/**
 * Display the main scoreboard operator page. This page is used to enter data into the
 * server to run the majority of the game. It serves controls to start and stop the Bout
 * edit the score, call Timeouts, and edit Lineups.
 */
export default function Operator() {
  const { data: allBouts } = useSuspenseGetAllBouts();
  const [boutUri] = useState<BoutUri>({ boutUuid: allBouts[0].uuid });

  const { data: ruleset } = useSuspenseRuleset(boutUri);
  const { data: bout } = useSuspenseBout(boutUri);

  const activeJamUri = useActiveJamUri(bout);
  const { data: activeJam } = useSuspenseJam(activeJamUri);

  const latestJamUri = useLatestJamUri(bout);
  void useJam(latestJamUri); // Used to prevent UI from blinking

  const latestTimeoutUri = useLatestTimeoutUri(bout);
  const { data: latestTimeout } = useTimeout({
    ...latestTimeoutUri,
    enabled: bout.timeoutCount > 0,
    throwOnError: false,
  });

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null =
    activeJam.stopTimestamp != null && latestTimeout?.stopTimestamp != null
      ? new Date(
          Math.max(
            new Date(activeJam.stopTimestamp).getTime(),
            new Date(latestTimeout.stopTimestamp).getTime(),
          ),
        ).toISOString()
      : (activeJam.stopTimestamp ?? latestTimeout?.stopTimestamp ?? null);

  return (
    <PageShell>
      <Stack>
        {/* Team information */}
        <Group justify="space-around" p="lg">
          {bout.teams.map((team: Team, i: number) => (
            <Card withBorder key={i} bg="gray.0">
              <Stack>
                <TeamName
                  uuid={bout.uuid}
                  num={team.num}
                  name={team.name}
                  ta="center"
                  fw="bolder"
                  size="36pt"
                />
                <Divider />
                <Grid justify="space-between" align="flex-end">
                  <Grid.Col
                    span="auto"
                    align="center"
                    order={{ sm: 1, md: 1, lg: i % 2 ? 3 : 1 }}
                  >
                    <Center>
                      <TimeoutsLeft
                        numTimeouts={ruleset.numTimeouts}
                        numReviews={ruleset.numReviews}
                        timeoutsRemaining={team.timeoutsRemaining}
                        reviewsRemaining={team.reviewsRemaining}
                        timeoutIsActive={
                          latestTimeout != null &&
                          isRunning(latestTimeout) &&
                          latestTimeout.teamNum === team.num
                        }
                        isReview={latestTimeout?.isReview ?? false}
                        size={28}
                      />
                    </Center>
                  </Grid.Col>
                  <Grid.Col span={6} order={2}>
                    <Center h="100%">
                      <Text fw="bold" h="100%" w={250} ta="center" size="76pt">
                        {team.boutScore + team.scoreOffset}
                      </Text>
                    </Center>
                  </Grid.Col>
                  <Grid.Col
                    span="auto"
                    order={{ sm: 3, md: 3, lg: i % 2 ? 1 : 3 }}
                  >
                    <Stack gap="md" justify="space-between">
                      <Text ta="center" size="24pt">
                        {/* TODO: Add Jammer state icon */}
                        &nbsp;
                      </Text>
                      <Card withBorder p="xs">
                        <Text ta="center" size="36pt">
                          {team.jamScore}
                        </Text>
                      </Card>
                    </Stack>
                  </Grid.Col>
                </Grid>
                <Divider />
                <Text
                  fw="semi-bold"
                  fs="italic"
                  ta="center"
                  px="mdFO"
                  size="24pt"
                >
                  {/* TODO: Add Jammer name chip */}
                  &nbsp;
                </Text>
              </Stack>
            </Card>
          ))}
        </Group>

        {/* Bout State View */}
        <Stack fz="36pt" ta="center" align="center">
          <Card withBorder w="content" bg="gray.0">
            <Grid justify="space-between" align="center" gap="sm">
              <Grid.Col span={4}>
                <BoutClock uuid={bout.uuid} {...bout.clock} inherit />
              </Grid.Col>
              <Grid.Col span={4} w={250}>
                <Group>
                  <Divider orientation="vertical" />
                  <JamNumber {...activeJamUri} fz="36pt" />
                  <Divider orientation="vertical" />
                </Group>
              </Grid.Col>
              <Grid.Col span={4}>
                <JamClock
                  jamDuration={ruleset.jamDuration}
                  {...activeJam}
                  {...activeJamUri}
                  inherit
                />
              </Grid.Col>
            </Grid>
          </Card>
          <Group
            justify="center"
            className={twMerge(bout.state == "jam" && "invisible")}
            fz="24pt"
          >
            <BoutStatus {...bout} inherit />
            {lastEventTimestamp != null && (
              <Clock startTimestamp={lastEventTimestamp} inherit />
            )}
          </Group>
        </Stack>

        {/* Bout State control */}
        <Group align="end" justify="center" mih="75">
          <BoutJamControl uuid={bout.uuid} state={bout.state} />
          <BoutTimeoutControl
            uuid={bout.uuid}
            state={bout.state}
            variant="subtle"
          />
          <BoutPeriodControl
            uuid={bout.uuid}
            state={bout.state}
            variant="subtle"
          />
          {bout.state == "timeout" && (
            <Suspense>
              <TimeoutTypeEditor
                timeoutUri={latestTimeoutUri}
                {...latestTimeout!}
              />
              <TimeoutCallerEditor
                timeoutUri={latestTimeoutUri}
                {...latestTimeout!}
                data={bout.teams.map((team: Team) => {
                  return {
                    value: String(team.num),
                    label: team.name,
                  };
                })}
              />
              <TimeoutRetainedEditor
                timeoutUri={latestTimeoutUri}
                {...latestTimeout!}
                variant="outline"
              />
            </Suspense>
          )}
          {bout.state == "lineup" && latestJamUri.jamNum > 0 && (
            <JamStopReasonEditor stopReason={activeJam.stopReason} />
          )}
        </Group>

        {/* TeamJam score editors */}
        <Suspense fallback={"Loading..."}>
          <SimpleGrid cols={bout.teams.length}>
            {[...Array(2).keys()].map((i: number) => (
              <Stack key={i}>
                <PassEditor
                  numPasses={ruleset.pointsPerTrip}
                  teamJamUri={{ teamNum: bout.teams[i].num, ...activeJamUri }}
                />
                <JammerStateEditor
                  teamJamUri={{ teamNum: bout.teams[i].num, ...activeJamUri }}
                  isLeadEligible={true} // TODO: check if lead eligible
                  teamJam={
                    activeJam.teamJams.find(
                      (tj) => tj.teamNum == bout.teams[i].num,
                    )!
                  }
                  justify="center"
                  gap="md"
                />
                <TeamJamTripHistory
                  events={
                    activeJam.teamJams.find(
                      (tj) => tj.teamNum == bout.teams[i].num,
                    )!.events
                  }
                />
              </Stack>
            ))}
          </SimpleGrid>
        </Suspense>

        {/* TODO: Add lineup editors */}
      </Stack>
    </PageShell>
  );
}
