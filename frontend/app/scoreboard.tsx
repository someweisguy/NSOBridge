import BoutState from "@/components/bout-state";
import TimeoutsLeft from "@/components/timeouts-left";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { Team } from "@/types/bout";
import { BoutUri } from "@/types/query";
import FitScreen from "@fit-screen/react";
import { Flex, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";

const root: HTMLElement | null = document.getElementById("root");
if (root == null) {
  throw new Error("Root HTML Node was not found.");
}
document.title = "Scoreboard";
createRoot(root).render(
  <AppProvider>
    <Scoreboard />
  </AppProvider>,
);

const urlParams = new URLSearchParams(window.location.search);
const boutParamName = "boutUuid";

/**
 * Display the audience-facing scoreboard. This has at-a-glance information about the
 * state of the bout as concisely and accessibly as possible.
 */
export function Scoreboard() {
  if (!urlParams.has(boutParamName)) {
    throw new Error("No Bout Provided");
  }
  const [boutUri] = useState<BoutUri>({
    boutUuid: urlParams.get(boutParamName)!,
  });

  const { data: ruleset } = useSuspenseRuleset(boutUri);
  const { data: bout } = useSuspenseBout(boutUri);

  const activeJamUri = useActiveJamUri(bout);
  const { data: activeJam } = useSuspenseJam(activeJamUri);

  const lastEventTimestamp: string | null =
    activeJam.startTimestamp != null
      ? new Date(
          Math.max(
            ...[
              activeJam.startTimestamp,
              activeJam.stopTimestamp,
              // latestTimeout?.startTimestamp,
              // latestTimeout?.stopTimestamp,
            ]
              .filter((val?: string | null) => val != null)
              .map((val: string) => new Date(val).getTime()),
          ),
        ).toISOString()
      : null;

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
        <BoutState
          activePeriodNum={activeJam.period}
          activeJamNum={activeJam.num}
          isOvertime={bout.jamCounts[2] > 0}
          eventTimestamp={lastEventTimestamp}
          {...bout}
          {...activeJam}
          {...ruleset}
        />
      </Stack>
    </FitScreen>
  );
}
