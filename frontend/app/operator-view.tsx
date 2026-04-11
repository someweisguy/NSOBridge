import { StatusClock } from "@/components/status-clock";
import BoutClock from "@/features/bouts/components/bout-clock";
import TeamName from "@/features/bouts/components/team-name";
import { JamClock } from "@/features/jams/components/jam-clock";
import JamNumber from "@/features/jams/components/jam-number";
import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { redo, undo } from "@/lib/history";
import { Bout, Team } from "@/types/bout";
import { Jam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense } from "react";
import { twMerge } from "tailwind-merge";
import "./global.css";
// import renderPage from "./render-page";

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

// // Create the React DOM
// const withShell = true;
// renderPage("NSO Bridge", Operator, withShell);

interface OperatorViewProps {
  bout: Bout;
  activeJam: Jam;
  latestJam: Jam;
  latestTimeout: Timeout | null;
}

/**
 * Display the main scoreboard operator page. This page is used to enter data into the
 * server to run the majority of the game. It serves controls to start and stop the Bout
 * edit the score, call Timeouts, and edit Lineups.
 */
export default function OperatorView({ bout, activeJam }: OperatorViewProps) {
  return (
    <Stack align="stretch" justify="flex-start">
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Stack key={i} justify="center">
            <TeamName
              teamName={team.name}
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
                numReviews={1}
                numTimeouts={3}
                timeoutsRemaining={team.timeoutsRemaining}
                reviewsRemaining={team.reviewsRemaining}
                timeoutIsActive={false} // TODO
                isReview={false} // TODO
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
            <BoutClock {...bout.clock} inherit />
            <JamNumber periodNum={activeJam.period} jamNum={activeJam.num} />
            <JamClock
              isStopped={activeJam.stopTimestamp != null}
              {...activeJam}
            />
          </Group>
        </Center>
        <StatusClock
          stateText="State" // TODO
          className={twMerge(bout.state == "jam" && "invisible")}
          inherit
          fz="24pt"
        />
      </Stack>

      {/* Bout State control */}
      <Group align="end" justify="center" mih="75">
        {/* // TODO */}
        {/* <BoutJamControlContainer boutUuid={bout.uuid} {...bout} /> */}
        {/* <BoutTimeoutControl boutUuid={bout.uuid} {...bout} variant="subtle" /> */}
        {/* <BoutPeriodControlContainer
          boutUuid={bout.uuid}
          {...bout}
          variant="subtle"
        /> */}
        {bout.state == "timeout" && (
          <Suspense>
            {/* <TimeoutTypeEditorContainer {...latestTimeoutUri} />
            <TimeoutCallerEditorContainer
              {...latestTimeoutUri}
              data={bout.teams.map((team: Team) => {
                return {
                  value: String(team.num),
                  label: team.name,
                };
              })}
            />
            <TimeoutRetainedEditorContainer
              {...latestTimeoutUri}
              variant="outline"
            /> */}
          </Suspense>
        )}
        {/* {bout.state == "lineup" && latestJamUri.jamNum > 0 && (
          <JamStopReasonEditorContainer {...activeJamUri} />
        )} */}
      </Group>

      {/* TeamJam score editors */}
      {/* <Suspense fallback={"Loading..."}>
        <SimpleGrid cols={bout.teams.length}>
          {[...Array(2).keys()].map((i: number) => (
            <Stack key={i}>
              <TeamJamPassEditorContainer {...activeJamUri} teamNum={i} />
              <JammerStateEditorContainer
                {...activeJamUri}
                teamNum={bout.teams[i].num}
                justify="center"
                gap="md"
              />
              <TeamJamTripHistoryContainer {...activeJamUri} teamNum={i} />
            </Stack>
          ))}
        </SimpleGrid>
      </Suspense> */}

      {/* TODO: Add lineup editors */}
    </Stack>
  );
}
