import PageShell from "@/components/page-shell";
import TeamCard from "@/components/team-card";
import GameClock from "@/features/bouts/components/game-clock";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import BoutClockEditor from "@/features/operator/components/bout-clock-editor";
import BoutControl from "@/features/operator/components/bout-control";
import TeamEditor from "@/features/operator/components/team-editor";
import TeamJamControl from "@/features/operator/components/team-jam-control";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/types/bout";
import { TeamJam } from "@/types/jam";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import {
  AppShell,
  Group,
  Modal,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  useModalsStack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  IconCheckupList,
  IconRollerSkating,
  IconStopwatch,
  IconTrafficLights,
  IconUsers,
} from "@tabler/icons-react";
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
  const { data: allBoutsSelectData } = useSuspenseGetAllBouts<
    {
      value: string;
      label: string;
    }[]
  >({
    select: (bouts: Bout[]) =>
      bouts.map((bout: Bout) => ({
        value: bout.uuid,
        label: bout.teams[0].name + " vs. " + bout.teams[1].name,
      })),
  });
  const [boutUri, setBoutUri] = useState<BoutUri>({
    boutUuid: allBouts[0].uuid,
  });

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
    "ruleset",
    ...bout.teams.map((team: Team) => "team-" + team.num),
    "bout-clock",
    "edit-jams",
    "edit-timeouts",
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
      navButtons={
        <Stack h="100%" gap="md" justify="space-between">
          <AppShell.Section component={ScrollArea}>
            <NavLink
              disabled
              label="Ruleset"
              leftSection={<IconCheckupList size={16} />}
              onClick={() => modalStack.open("ruleset")}
            />
            <NavLink
              defaultOpened
              label="Teams & Rosters"
              leftSection={<IconUsers size={16} />}
            >
              {bout.teams.map((team: Team) => (
                <NavLink
                  key={team.num}
                  label={team.name}
                  onClick={() => modalStack.open("team-" + team.num)}
                />
              ))}
            </NavLink>
            <NavLink
              label="Bout Clock"
              leftSection={<IconStopwatch size={16} />}
              onClick={() => modalStack.open("bout-clock")}
            />
            <NavLink
              disabled
              label="Jams"
              leftSection={<IconRollerSkating size={16} />}
              onClick={() => modalStack.open("edit-jams")}
            />
            <NavLink
              disabled
              label="Timeouts"
              leftSection={<IconTrafficLights size={16} />}
              onClick={() => modalStack.open("edit-timeouts")}
            />
          </AppShell.Section>
          <AppShell.Section p="sm">
            <Select
              label="Current Bout"
              data={allBoutsSelectData}
              value={boutUri.boutUuid}
              allowDeselect={false}
              onChange={(boutUuid: string | null) => {
                if (boutUuid != null) {
                  setBoutUri({ boutUuid });
                }
              }}
            />
          </AppShell.Section>
        </Stack>
      }
    >
      <Modal.Stack>
        <Modal title="Select Ruleset" {...modalStack.register("ruleset")}>
          Edit ruleset...
        </Modal>
        {bout.teams.map((team: Team) => (
          <Modal
            key={team.num}
            title={"Edit " + team.name}
            {...modalStack.register("team-" + team.num)}
          >
            <TeamEditor boutUuid={bout.uuid} {...team} />
          </Modal>
        ))}
        <Modal title="Edit Bout Clock" {...modalStack.register("bout-clock")}>
          <BoutClockEditor
            boutUuid={bout.uuid}
            isRunning={bout.clock.startTimestamp != null}
          />
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

        <GameClock
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
