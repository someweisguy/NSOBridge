import PageShell from "@/components/page-shell";
import ResponsiveScroller from "@/components/responsive-scroller";
import BoutCreator from "@/features/bouts/components/bout-creator";
import EventClock from "@/features/bouts/components/event-clock";
import GameClock from "@/features/bouts/components/game-clock";
import TeamScore from "@/features/bouts/components/team-score";
import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import { useSuspenseBout } from "@/features/bouts/hooks/use-bout";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import JammerTrip from "@/features/jams/components/jammer-trip";
import { useJam, useSuspenseJam } from "@/features/jams/hooks/use-jam";
import BoutControl from "@/features/operator/components/bout-control";
import EditMenu from "@/features/operator/components/edit-menu";
import EndBoutControl from "@/features/operator/components/end-bout-control";
import JammerStateControl from "@/features/operator/components/jammer-state-control";
import JammerTripControl from "@/features/operator/components/jammer-trip-control";
import JamStopReasonEditor from "@/features/operator/components/stop-reason-editor";
import TimeoutEditor from "@/features/operator/components/timeout-editor";
import { useSetActiveBout } from "@/features/operator/hooks/use-set-active-bout";
import {
  useSuspenseGetAllRulesets,
  useSuspenseGetRuleset,
} from "@/hooks/use-ruleset";
import { useSuspenseGetAllSeries } from "@/hooks/use-series";
import { useTimeout } from "@/hooks/use-timeout";
import { localAPI } from "@/lib/requests";
import { Bout, BoutSubStateString, Team } from "@/types/bout";
import { TeamJam, TripEvent } from "@/types/jam";
import { BoutUri } from "@/types/query";
import { Ruleset } from "@/types/ruleset";
import { Series } from "@/types/series";
import { boutKeys } from "@/utils/query-keys";
import { isRunning } from "@/utils/time";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Fieldset,
  Group,
  Modal,
  Select,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink, IconPlus } from "@tabler/icons-react";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
 * Display the main scoreboard operator page. This page is used to enter data into the
 * server to run the majority of the game. It serves controls to start and stop the Bout
 * edit the score, call Timeouts, and edit Lineups.
 *
 * This page should be designed to fit within a viewport that is 1280px by 585px.
 */
export default function Operator() {
  const { data: activeSeries } = useSuspenseGetAllSeries({
    select: (allSeries: Series[]) => allSeries[allSeries.length - 1],
  });

  const { data: bouts, isPending: boutsArePending } = useQueries({
    queries: activeSeries.boutUuids.map((boutUuid: string) => ({
      queryKey: boutKeys.one(boutUuid),
      queryFn: () =>
        localAPI.get<Bout>("bout", {
          query: { boutUuid },
        }),
    })),
    combine: useCallback(
      (results: UseQueryResult<Bout, Error>[]) => ({
        data: results.map((result) => result.data),
        isPending: results.some((result) => result.isPending),
      }),
      [],
    ),
  });

  const { data: allRulesetNames } = useSuspenseGetAllRulesets({
    select: (rulesets: Ruleset[]) =>
      rulesets.map((ruleset: Ruleset) => ruleset.name),
  });

  const [boutUri, setBoutUri] = useState<BoutUri>({
    boutUuid: activeSeries.activeBoutUuid,
  });

  const { data: bout } = useSuspenseBout(boutUri);
  const { data: ruleset } = useSuspenseGetRuleset(bout);

  useEffect(() => {
    if (activeSeries.boutUuids.includes(bout.uuid)) {
      return;
    }
    setBoutUri({
      boutUuid: activeSeries.boutUuids[activeSeries.boutUuids.length - 1],
    });
  }, [bout.uuid, activeSeries.boutUuids]);

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

  const [opened, { open, close }] = useDisclosure(false);

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

  const setActiveBout = useSetActiveBout({ seriesUuid: activeSeries.uuid });

  return (
    <PageShell
      header={
        <>
          <Select
            withAlignedLabels
            size="xs"
            data={bouts
              .filter((b) => b != null)
              .map((b) => ({
                value: b.uuid,
                label: b.teams.map((t) => t.name).join(" vs. "),
              }))}
            loading={boutsArePending}
            value={boutUri.boutUuid}
            allowDeselect={false}
            onChange={(boutUuid: string | null) => {
              if (boutUuid != null) {
                setBoutUri({ boutUuid });
                setActiveBout.mutate(boutUuid);
              }
            }}
          />
          <Tooltip withArrow fz="xs" label="Create a Bout">
            <ActionIcon variant="light" onClick={open}>
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <EditMenu {...bout} />
          <Button
            size="xs"
            variant="subtle"
            justify="space-between"
            rightSection={<IconExternalLink size={16} />}
            onClick={() =>
              window.open(
                window.location.href + "sb?seriesUuid=" + activeSeries.uuid,
                "_blank",
              )
            }
          >
            Open Scoreboard
          </Button>
          &nbsp;
        </>
      }
      navButtons={
        <Stack>
          <Box h="100px">
            <Card withBorder orientation="vertical" fz="h4" p="0">
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
                  p="xs"
                  fz="h3"
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
          </Box>
          <BoutControl
            latestJamUri={latestJamUri}
            state={bout.state}
            disabled={bout.state == "final"}
          />

          <Collapse
            expanded={activeJamUri.periodNum >= 1 && bout.state == "stopped"}
          >
            <EndBoutControl boutUuid={boutUri.boutUuid} />
          </Collapse>

          <Collapse
            expanded={
              (bout.state == "lineup" || bout.state == "timeout") &&
              latestJamUri.jamNum > 0
            }
          >
            <JamStopReasonEditor
              p="xs"
              stopReason={activeJam.stopReason}
              jamUri={activeJamUri}
            />
          </Collapse>

          <Collapse expanded={bout.state == "timeout" && timeoutIsFetched}>
            <TimeoutEditor
              p="xs"
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
        </Stack>
      }
    >
      <Modal title="Create New Bout" opened={opened} onClose={close}>
        <BoutCreator
          rulesetNames={allRulesetNames}
          seriesUuid={activeSeries.uuid}
          onSuccess={(newBout: Bout) => {
            setBoutUri({ boutUuid: newBout.uuid });
            setActiveBout.mutate(newBout.uuid);
            close();
          }}
        />
      </Modal>

      <Stack gap="sm" align="stretch" w="100%">
        <Group justify="space-around" gap="lg">
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
              <Card withBorder key={team.num} w="350px" px="0">
                <Stack align="stretch" w="350px">
                  <Title ta="center" fz="h3">
                    {team.name}
                  </Title>
                  <Center>
                    <TeamScore
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
                      noInitial={numTrips == 0}
                      textSize={20}
                      {...team}
                    />
                  </Center>

                  {teamJam != null && (
                    <Fieldset
                      variant="unstyled"
                      disabled={
                        activeJam.startTimestamp == null ||
                        bout.state == "final"
                      }
                    >
                      <Stack gap="xs">
                        <Divider
                          label="Edit Jammer"
                          variant="dashed"
                          w="100%"
                        />
                        <JammerStateControl
                          justify="space-between"
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
                        <Divider label="Add Trips" variant="dashed" w="100%" />
                        <JammerTripControl
                          teamJamUri={{ teamNum: team.num, ...activeJamUri }}
                          showInitial={numTrips == 0}
                          numPasses={ruleset.pointsPerTrip}
                          {...teamJam}
                          {...ruleset}
                        />
                        <ResponsiveScroller m="0" h="100px">
                          {teamJam.events
                            .filter(
                              (tripEvent: TripEvent) =>
                                tripEvent.passes != null,
                            )
                            .map((tripEvent: TripEvent, i: number) => (
                              <JammerTrip
                                w="80px"
                                key={i}
                                tripIndex={i}
                                teamJamUri={{
                                  teamNum: teamJam.teamNum,
                                  ...activeJamUri,
                                }}
                                {...tripEvent}
                                {...ruleset}
                              />
                            ))}
                        </ResponsiveScroller>
                      </Stack>
                    </Fieldset>
                  )}
                  {/* TODO: Add lineup editors */}
                </Stack>
              </Card>
            );
          })}
        </Group>
      </Stack>
    </PageShell>
  );
}
