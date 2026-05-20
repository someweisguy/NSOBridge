import PageShell from "@/components/page-shell";
import TeamCard from "@/components/team-card";
import BoutClock from "@/features/bouts/components/game-clock";
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
import { Team } from "@/types/bout";
import { TeamJam } from "@/types/jam";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import { Group, Modal, NavLink, Stack, useModalsStack } from "@mantine/core";
import "@mantine/core/styles.css";
import { IconListNumbers, IconStopwatch, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";

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

  const modalStack = useModalsStack([
    "teams-rosters",
    "bout-clock",
    "timeouts",
    "score-offset",
    ...bout.teams.map((team: Team) => team.name),
  ]);

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
    <PageShell
      navButtons={[
        <NavLink
          key={0}
          label="Ruleset"
          leftSection={<IconListNumbers size={16} />}
          onClick={() => modalStack.open("ruleset")}
        />,
        <NavLink
          defaultOpened
          key={1}
          label="Teams & Rosters"
          leftSection={<IconUsers size={16} />}
        >
          {bout.teams.map((team: Team) => (
            <NavLink
              key={team.num}
              label={team.name}
              onClick={() => modalStack.open(team.name)}
            />
          ))}
        </NavLink>,
        <NavLink
          key={2}
          label="Bout Clock"
          leftSection={<IconStopwatch size={16} />}
          onClick={() => modalStack.open("bout-clock")}
        />,
      ]}
    >
      <Modal.Stack>
        {bout.teams.map((team: Team) => (
          <Modal
            key={team.num}
            title={"Edit " + team.name}
            {...modalStack.register(team.name)}
          >
            Editing {team.name}
          </Modal>
        ))}
        <Modal
          title="Edit Teams & Rosters"
          {...modalStack.register("teams-rosters")}
        >
          Hello world!
        </Modal>
        <Modal title="Edit Bout Clock" {...modalStack.register("bout-clock")}>
          Hello world!
        </Modal>
        <Modal title="Select Ruleset" {...modalStack.register("ruleset")}>
          Hello world!
        </Modal>
        <Modal
          title="Edit Score Offset"
          {...modalStack.register("score-offset")}
        >
          Hello world!
        </Modal>
      </Modal.Stack>

      <Stack gap="sm">
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

        <BoutClock
          activePeriodNum={activeJam.period}
          activeJamNum={activeJam.num}
          isOvertime={bout.jamCounts[2] > 0}
          eventTimestamp={lastEventTimestamp}
          {...bout}
          {...activeJam}
          {...ruleset}
        />

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
