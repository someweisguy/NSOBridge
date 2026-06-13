import EventClock from "@/features/bouts/components/event-clock";
import GameClock from "@/features/bouts/components/game-clock";
import TeamScore from "@/features/bouts/components/team-score";
import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import { useSuspenseBout } from "@/features/bouts/hooks/use-bout";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import { useJam, useSuspenseJam } from "@/features/jams/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { useSuspenseSeries } from "@/hooks/use-series";
import { useTimeout } from "@/hooks/use-timeout";
import { BoutSubStateString, Team } from "@/types/bout";
import { TeamJam, TripEvent } from "@/types/jam";
import { isRunning } from "@/utils/time";
import FitScreen from "@fit-screen/react";
import {
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";

const root: HTMLElement | null = document.getElementById("root");
if (root != null) {
  document.title = "Scoreboard";
  createRoot(root).render(
    <AppProvider>
      <Scoreboard />
    </AppProvider>,
  );
}

const eventNames: Record<BoutSubStateString, string> = {
  pregame: "Pregame",
  halftime: "Halftime",
  unofficial: "Unofficial",
  lineup: "Lineup",
  post_review: "Post-review",
  post_timeout: "Post-timeout",
  jam: "Jam",
  timeout: "Timeout",
  review: "Official Review",
  team_timeout: "Team Timeout",
  official_timeout: "Official Timeout",
  final: "Final",
};

/**
 * Display the audience-facing scoreboard. This has at-a-glance information about the
 * state of the bout as concisely and accessibly as possible.
 */
export function Scoreboard() {
  const [seriesUuid] = useState(
    new URLSearchParams(window.location.search).get("seriesUuid"),
  );
  if (seriesUuid == null) {
    throw new Error("No Series Provided");
  }
  const { data: series } = useSuspenseSeries({ seriesUuid });

  const { data: ruleset } = useSuspenseRuleset({
    boutUuid: series.activeBoutUuid,
  });
  const { data: bout } = useSuspenseBout({ boutUuid: series.activeBoutUuid });

  const activeJamUri = useActiveJamUri(bout);
  const { data: activeJam } = useSuspenseJam(activeJamUri);
  const latestJamUri = useLatestJamUri(bout);
  void useJam(latestJamUri); // Prevent UI from blinking

  const latestTimeoutUri = useLatestTimeoutUri(bout);
  const { data: latestTimeout } = useTimeout({
    ...latestTimeoutUri,
    enabled: bout.timeoutCount > 0,
    throwOnError: false,
  });

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null =
    activeJam.startTimestamp != null
      ? new Date(
          Math.max(
            ...[
              activeJam.startTimestamp,
              activeJam.stopTimestamp,
              latestTimeout?.startTimestamp,
              latestTimeout?.stopTimestamp,
            ]
              .filter((val?: string | null) => val != null)
              .map((val: string) => new Date(val).getTime()),
          ),
        ).toISOString()
      : null;

  return (
    <FitScreen waitTime={25} mode="fit" className="bg-black">
      <Stack gap="xl" justify="space-around" h="100%" py="xl">
        <Group justify="space-around" align="self-start" gap="lg">
          {bout.teams.map((team: Team, i: number) => {
            const teamJam = activeJam.teamJams.find(
              (tj: TeamJam) => tj.teamNum == team.num,
            );

            const lead = teamJam?.events.some((event) => event.lead) ?? false;
            const lost = teamJam?.events.some((event) => event.lost) ?? false;
            const starPass =
              teamJam?.events.some((event) => event.starPass) ?? false;
            const numTrips =
              teamJam?.events.reduce<number>(
                (sum: number, event: TripEvent) =>
                  sum + Number(event.passes != null),
                0,
              ) ?? 0;

            return (
              <Card key={team.num} px="0">
                <Stack align="stretch">
                  <Title ta="center" fz="68pt">
                    {team.name}
                  </Title>
                  <Center>
                    <TeamScore
                      px="xl"
                      reverse={!!(i % 2)}
                      aside={
                        <TimeoutsLeft
                          timeoutIsActive={
                            latestTimeout != null &&
                            isRunning(latestTimeout) &&
                            latestTimeout.teamNum === team.num
                          }
                          isReview={latestTimeout?.isReview ?? false}
                          size={36}
                          {...team}
                          {...ruleset}
                        />
                      }
                      lead={lead}
                      lost={lost}
                      starPass={starPass}
                      noInitial={numTrips == 0}
                      textSize={48}
                      {...team}
                    />
                  </Center>
                  <Divider />
                  <Text ta="center" fz="42pt" td="underline" h="6rem">
                    {lead && !lost && "Lead"}
                  </Text>
                </Stack>
              </Card>
            );
          })}
        </Group>
        <Center>
          <Card withBorder fz="48pt" w="75%" p="0">
            <GameClock
              align="center"
              p="xs"
              activePeriodNum={activeJam.period}
              activeJamNum={activeJam.num}
              isOvertime={activeJam.period > 2}
              {...bout}
              {...activeJam}
              {...ruleset}
            />
            <Divider
              orientation="horizontal"
              size={bout.state != "jam" ? "xs" : 0}
            />
            <Collapse expanded={bout.state != "jam"} bg="yellow.3">
              <EventClock
                p="sm"
                fz="42pt"
                ta="center"
                hideClock={
                  bout.state == "stopped" ||
                  bout.state == "final" ||
                  (bout.state == "lineup" && latestJamUri.jamNum == 0)
                }
                prefix={eventNames[bout.subState]}
                startTimestamp={lastEventTimestamp}
                {...bout}
              />
            </Collapse>
          </Card>
        </Center>
      </Stack>
    </FitScreen>
  );
}
