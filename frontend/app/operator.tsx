import BoutState from "@/components/bout-state";
import PageShell from "@/components/page-shell";
import TeamCard from "@/components/team-card";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import BoutControl from "@/features/operator/components/bout-control";
import TeamJamControl from "@/features/operator/components/team-jam-control";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { redo, undo } from "@/lib/history";
import { Team } from "@/types/bout";
import { TeamJam } from "@/types/jam";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
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
    <PageShell>
      <Stack gap="sm">
        {/* Bout State control */}
        <BoutControl
          latestPeriodNum={latestJamUri.periodNum}
          latestJamNum={latestJamUri.jamNum}
          latestTimeoutNum={latestTimeoutUri.timeoutNum}
          teamData={bout.teams.map((team: Team) => {
            return { label: team.name, value: String(team.num) };
          })}
          {...bout}
          {...activeJam}
          {...latestTimeout}
        />

        {/* Team information */}
        <Group justify="space-around">
          {bout.teams.map((team: Team, i: number) => (
            <TeamCard
              key={i}
              teamName={team.name}
              reverse={!!(i % 2)}
              timeoutIsActive={
                latestTimeout != null &&
                isRunning(latestTimeout) &&
                latestTimeout.teamNum === team.num
              }
              {...bout}
              {...team}
              {...latestTimeout}
              {...ruleset}
            />
          ))}
        </Group>

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

        {/* TeamJam score editors */}
        <Group justify="space-around">
          {activeJam.teamJams.map((teamJam: TeamJam) => (
            <TeamJamControl
              key={teamJam.teamNum}
              boutUuid={activeJam.boutUuid}
              periodNum={activeJam.period}
              jamNum={activeJam.num}
              isLeadEligible={true} // TODO: Compute lead eligibility
              {...teamJam}
              {...ruleset}
            />
          ))}
        </Group>

        {/* TODO: Add lineup editors */}
      </Stack>
    </PageShell>
  );
}
