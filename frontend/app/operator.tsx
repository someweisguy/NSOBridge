import PageShell from "@/components/page-shell";
import ResponsiveScroller from "@/components/responsive-scroller";
import BoutCreator from "@/features/bouts/components/bout-creator";
import EventClock from "@/features/bouts/components/event-clock";
import GameClock from "@/features/bouts/components/game-clock";
import TeamScore from "@/features/bouts/components/team-score";
import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import JammerTrip from "@/features/jams/components/jammer-trip";
import BoutClockEditor from "@/features/operator/components/bout-clock-editor";
import BoutControl from "@/features/operator/components/bout-control";
import JamStopReasonEditor from "@/features/operator/components/stop-reason-editor";
import TeamEditor from "@/features/operator/components/team-editor";
import TeamJamControl from "@/features/operator/components/team-jam-control";
import TeamJamTripHistory from "@/features/operator/components/team-jam-trip-history";
import TimeoutEditor from "@/features/operator/components/timeout-editor";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseAllRulesetNames } from "@/hooks/use-suspense-all-ruleset-names";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/types/bout";
import { TeamJam, TripEvent } from "@/types/jam";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import {
  AppShell,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Grid,
  Group,
  Modal,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Title,
  useModalsStack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  IconCheckupList,
  IconExternalLink,
  IconPlus,
  IconRollerSkating,
  IconStopwatch,
  IconTrafficLights,
  IconUserExclamation,
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
 *
 * This page should be designed to fit within a viewport that is 1280px by 585px.
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
    boutUuid: allBouts[allBouts.length - 1].uuid,
  });
  const { data: rulesetNames } = useSuspenseAllRulesetNames();

  const { data: ruleset } = useSuspenseRuleset(boutUri);
  const { data: bout } = useSuspenseBout(boutUri);

  const activeJamUri = useActiveJamUri(bout);
  const { data: activeJam } = useSuspenseJam(activeJamUri);

  const latestJamUri = useLatestJamUri(bout);
  void useJam(latestJamUri); // Used to prevent UI from blinking

  const latestTimeoutUri = useLatestTimeoutUri(bout);
  const { data: latestTimeout, isFetched: timeoutIsFetched } = useTimeout({
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
    "create-bout",
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
              <NavLink
                disabled
                label="Officials"
                onClick={() => modalStack.open("officials")}
              />
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
            <NavLink
              disabled
              label="Penalties"
              leftSection={<IconUserExclamation size={16} />}
              onClick={() => modalStack.open("edit-penalties")}
            />
          </AppShell.Section>
          <AppShell.Section p="sm">
            <Stack gap="sm" align="stretch">
              <Divider />
              <Select
                withAlignedLabels
                label="Select a Bout"
                data={allBoutsSelectData}
                value={boutUri.boutUuid}
                allowDeselect={false}
                onChange={(boutUuid: string | null) => {
                  if (boutUuid != null) {
                    setBoutUri({ boutUuid });
                  }
                }}
                comboboxProps={{
                  position: "top",
                  middlewares: { flip: false, shift: false },
                  offset: 0,
                }}
              />
              <Button
                variant="subtle"
                rightSection={<IconExternalLink size={16} />}
                onClick={() =>
                  window.open(
                    window.location.href + "sb?boutUuid=" + boutUri.boutUuid,
                    "_blank",
                  )
                }
              >
                Open Scoreboard
              </Button>
              <Divider />
              <Button
                variant="light"
                rightSection={<IconPlus size={16} />}
                onClick={() => modalStack.open("create-bout")}
              >
                Create New Bout
              </Button>
            </Stack>
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
        <Modal title="Create New Bout" {...modalStack.register("create-bout")}>
          <BoutCreator
            rulesetNames={rulesetNames}
            onSuccess={(boutUuid) => {
              setBoutUri({ boutUuid });
              modalStack.closeAll();
            }}
          />
        </Modal>
      </Modal.Stack>

      <Stack gap="sm" align="stretch" w="100%">
        <Group justify="space-between" wrap="nowrap">
          <BoutControl boutUuid={bout.uuid} state={bout.state} />
          <Group w="100%" justify="space-between">
            <Box>
              <Collapse
                orientation="horizontal"
                expanded={bout.state == "timeout" && timeoutIsFetched}
                w="fit-content"
              >
                <TimeoutEditor
                  timeoutUri={latestTimeoutUri}
                  teamNum={latestTimeout?.teamNum ?? null}
                  teamIsOfficials={latestTimeout?.teamIsOfficials ?? false}
                  isReview={latestTimeout?.isReview ?? false}
                  isRetained={latestTimeout?.retained ?? false}
                  teamData={bout.teams.map((team: Team) => {
                    return { label: team.name, value: String(team.num) };
                  })}
                />
              </Collapse>
            </Box>
            <Collapse
              orientation="horizontal"
              w="fit-content"
              expanded={
                (bout.state == "lineup" || bout.state == "timeout") &&
                latestJamUri.jamNum > 0
              }
            >
              <JamStopReasonEditor
                size="xs"
                stopReason={activeJam.stopReason}
                jamUri={activeJamUri}
              />
            </Collapse>
          </Group>
        </Group>

        <Center>
          <Grid
            columns={bout.teams.length + 1}
            align="center"
            w="fit-content"
            gap="lg"
          >
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
                  (numTrips: number, event: TripEvent) =>
                    (numTrips += Number(event.passes != null)),
                  0,
                ) ?? 0;

              return (
                <Grid.Col span={1} key={team.num} order={i == 1 ? 2 : 0}>
                  <Card withBorder px="0">
                    <Stack align="center">
                      <Title ta="center" fz="h3">
                        {team.name}
                      </Title>
                      <TeamScore
                        w={250}
                        reverse={!!(i % 2)}
                        aside={
                          <TimeoutsLeft
                            timeoutIsActive={
                              latestTimeout != null &&
                              isRunning(latestTimeout) &&
                              latestTimeout.teamNum === team.num
                            }
                            isReview={latestTimeout?.isReview ?? false}
                            size={13}
                            {...team}
                            {...ruleset}
                          />
                        }
                        lead={lead}
                        lost={lost}
                        starPass={starPass}
                        textSize={20}
                        {...team}
                      />

                      {teamJam != null && (
                        <>
                          <Divider
                            label="Edit Jammer"
                            variant="dashed"
                            w="100%"
                          />
                          <TeamJamControl
                            w="300px"
                            mx="md"
                            boutUuid={activeJam.boutUuid}
                            periodNum={activeJam.period}
                            jamNum={activeJam.num}
                            lead={lead}
                            lost={lost}
                            starPass={starPass}
                            leadIsDeclared={teamJam.events.some(
                              (event) => event.lead,
                            )}
                            {...teamJam}
                            {...ruleset}
                          />
                          <Divider
                            label="Add Trips"
                            variant="dashed"
                            w="100%"
                          />
                          <TeamJamTripHistory
                            teamJamUri={{ teamNum: team.num, ...activeJamUri }}
                            showInitial={numTrips == 0}
                            numPasses={ruleset.pointsPerTrip}
                            {...teamJam}
                            {...ruleset}
                          />
                          <ResponsiveScroller>
                            {teamJam.events.map(
                              (event: TripEvent, i: number) => (
                                <JammerTrip
                                  w="80px"
                                  key={i}
                                  tripIndex={i}
                                  {...event}
                                  {...ruleset}
                                />
                              ),
                            )}
                          </ResponsiveScroller>
                        </>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}

            <Grid.Col span={1} order={1}>
              <Center>
                <Card withBorder orientation="vertical" fz="h4" p="0">
                  <GameClock
                    align="center"
                    p="xs"
                    w="250px"
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
                  <Collapse
                    orientation="vertical"
                    expanded={bout.state != "jam"}
                    bg="yellow.3"
                  >
                    <EventClock
                      p="xs"
                      fz="h4"
                      ta="center"
                      miw="200px"
                      startTimestamp={lastEventTimestamp}
                      {...bout}
                    />
                  </Collapse>
                </Card>
              </Center>
            </Grid.Col>
          </Grid>
        </Center>
        {/* TODO: Add lineup editors */}
      </Stack>
    </PageShell>
  );
}
