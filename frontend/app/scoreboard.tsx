import BoutClock from "@/features/bouts/components/bout-clock";
import BoutStatus from "@/features/bouts/components/bout-status";
import { JamClock } from "@/features/jams/components/jam-clock";
import JamNumber from "@/features/jams/components/jam-number";
import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { Team } from "@/types/bout";
import { BoutUri } from "@/types/query";
import FitScreen from "@fit-screen/react";
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
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

  const activeJamUri = bout.getActiveJamUri();
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
        <Stack fz="72pt" ta="center" align="stretch">
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
            fz="48pt"
          />
        </Stack>
      </Stack>
    </FitScreen>
  );
}
