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
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
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

  return (
    <PageShell>
      <Stack align="stretch" justify="flex-start">
        {/* Team information */}
        <SimpleGrid cols={bout.teams.length}>
          {bout.teams.map((team: Team, i: number) => (
            <Stack key={i} justify="center">
              <TeamName
                uuid={bout.uuid}
                num={team.num}
                name={team.name}
                ta="center"
                fw="bolder"
                size="36pt"
              />
              <Flex
                direction={i % 2 ? "row-reverse" : "row"}
                align="center"
                justify="center"
                gap="md"
              >
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
                  size={24}
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
        <Stack fz="36pt" ta="center" align="stretch">
          <Center>
            <Group grow justify="center" w="75%" ta="center">
              <BoutClock uuid={bout.uuid} {...bout.clock} inherit />
              <JamNumber {...activeJamUri} inherit />
              <JamClock
                jamDuration={ruleset.jamDuration}
                {...activeJam}
                {...activeJamUri}
                inherit
              />
            </Group>
          </Center>
          <BoutStatus
            {...bout}
            className={twMerge(bout.state == "jam" && "invisible")}
            inherit
            fz="24pt"
          />
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
