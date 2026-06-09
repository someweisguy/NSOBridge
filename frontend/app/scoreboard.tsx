import GameClock from "@/features/bouts/components/game-clock";
import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import { useSuspenseBout } from "@/features/bouts/hooks/use-bout";
import { useSuspenseJam } from "@/features/jams/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { useSuspenseSeries } from "@/hooks/use-series";
import { Team } from "@/types/bout";
import FitScreen from "@fit-screen/react";
import { Flex, SimpleGrid, Stack, Text } from "@mantine/core";
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
                <TimeoutsLeft
                  numTimeouts={ruleset.numTimeouts}
                  numReviews={ruleset.numReviews}
                  timeoutsRemaining={team.timeoutsRemaining}
                  reviewsRemaining={team.reviewsRemaining}
                  timeoutIsActive={false} // TODO: use active timeout
                  isReview={false} // TODO: use active timeout
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
        <GameClock
          activePeriodNum={activeJam.period}
          activeJamNum={activeJam.num}
          isOvertime={bout.jamCounts[2] > 0}
          {...bout}
          {...activeJam}
          {...ruleset}
        />
      </Stack>
    </FitScreen>
  );
}
