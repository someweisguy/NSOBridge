import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import BoutClock from "@/features/new-operator/components/bout-clock";
import BoutController from "@/features/new-operator/components/bout-controller";
import BoutCreator from "@/features/new-operator/components/bout-creator";
import BoutPicker from "@/features/new-operator/components/bout-picker";
import JammerController from "@/features/new-operator/components/jammer-controller";
import TripController from "@/features/new-operator/components/trip-controller";
import Undoer from "@/features/new-operator/components/undoer";
import useSuspenseActiveJam from "@/features/new-operator/hooks/use-active-jam";
import useBoutPicker from "@/features/new-operator/hooks/use-bout-picker";
import { useLatestJam } from "@/features/new-operator/hooks/use-latest-jam";
import useLatestTimeout from "@/features/new-operator/hooks/use-latest-timeout";
import useSeriesPicker from "@/features/new-operator/hooks/use-series-picker";
import BoutEditor from "@/features/operator/components/bout-editor";
import { useGetAllRulesets, useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import useSuspendIfNullable from "@/hooks/use-suspend-if-nullable";
import { Bout, Team } from "@/types/bout";
import { TeamJam } from "@/types/jam";
import { isRunning } from "@/utils/time";
import {
  AppShell,
  AppShellProps,
  Burger,
  Card,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  NavLink,
  Paper,
  px,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import {
  IconExternalLink,
  IconStarFilled,
  IconStarOff,
} from "@tabler/icons-react";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";
const root: HTMLElement | null = document.getElementById("root");
if (root != null) {
  document.title = "NSO Bridge";
  createRoot(root).render(
    <AppProvider>
      <OperatorPage />
    </AppProvider>,
  );
}

const appShellConfig = (disclosure: boolean): AppShellProps => ({
  layout: "alt",
  header: { height: 60 },
  footer: { height: 60 },
  navbar: {
    width: 300,
    breakpoint: "sm",
    collapsed: { desktop: !disclosure, mobile: !disclosure },
  },
  padding: "md",
});

const jammerStatusIconSize = "1rem";

function OperatorBoutController({ bout }: { bout: Bout }) {
  return (
    <Stack mb="lg" w={225}>
      <Stack gap="0" w="100%">
        <BoutClock bout={bout} />
        <Divider />
      </Stack>
      <Stack justify="start" align="stretch" px="xs">
        <BoutController bout={bout} />
      </Stack>
    </Stack>
  );
}

function OperatorTeamJamController({
  bout,
  team,
  reverse,
}: {
  bout: Bout;
  team: Team;
  reverse: boolean;
}) {
  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);
  void useLatestJam(bout); // Prefetch to avoid UI blinking
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const teamJam = activeJam.teamJams.find(
    (teamJam: TeamJam) => team.num == teamJam.teamNum,
  );
  const lead = teamJam?.events.some((event) => event.lead) ?? false;
  const lost = teamJam?.events.some((event) => event.lost) ?? false;
  const starPass = teamJam?.events.some((event) => event.starPass) ?? false;
  const initial =
    teamJam?.events.some((event) => event.passes != null) ?? false;

  return (
    <Stack justify="start" align="center">
      <Title ta="center" fz="h3">
        {team.name}
      </Title>
      <Grid justify="space-around" align="last baseline" w="100%">
        <Grid.Col
          span={3}
          align="center"
          style={{ alignSelf: "center", placeItems: "center" }}
          order={reverse ? 12 : 1}
        >
          <TimeoutsLeft
            timeoutIsActive={
              latestTimeout != null &&
              isRunning(latestTimeout) &&
              latestTimeout.teamNum === team.num
            }
            isReview={latestTimeout?.isReview ?? false}
            {...team}
            {...ruleset}
            h="4rem"
          />
        </Grid.Col>
        <Grid.Col span={4} order={2}>
          <Text fz="3rem" ta="center">
            {team.boutScore + team.scoreOffset}
          </Text>
        </Grid.Col>
        <Grid.Col span={3} order={reverse ? 1 : 12}>
          <Flex
            justify="start"
            align="center"
            direction="column-reverse"
            gap="0"
          >
            <Paper
              withBorder
              fz="2rem"
              w="3rem"
              ta="center"
              style={{ aspectRatio: "1/1" }}
            >
              {initial ? team.jamScore : "-"}
            </Paper>
            {starPass ? (
              <Text fw="500" size={jammerStatusIconSize}>
                SP
              </Text>
            ) : lost ? (
              <IconStarOff size={px(jammerStatusIconSize)} />
            ) : lead ? (
              <IconStarFilled size={px(jammerStatusIconSize)} />
            ) : (
              <></>
            )}
          </Flex>
        </Grid.Col>
      </Grid>
      <JammerController
        justify="space-between"
        mx="md"
        jam={activeJam}
        team={team}
        {...ruleset}
      />
      <TripController jam={activeJam} team={team} {...ruleset} w="100%" />
    </Stack>
  );
}

function OperatorInterface({ bout }: { bout: Bout | undefined }) {
  useSuspendIfNullable(bout);

  return (
    <Card
      withBorder
      orientation="horizontal"
      w="fit-content"
      h="fit-content"
      m="md"
      shadow="lg"
    >
      <Card.Section withBorder>
        <OperatorBoutController bout={bout} />
      </Card.Section>
      <Group justify="space-around" align="start" px="lg">
        <Suspense fallback={<Loader />}>
          {bout.teams.map((team: Team, i: number) => (
            <OperatorTeamJamController
              key={team.num}
              bout={bout}
              team={team}
              reverse={!!(i % 2)}
            />
          ))}
        </Suspense>
      </Group>
    </Card>
  );
}

/**
 * Display the main scoreboard operator page. This page is used to enter data into the
 * server to run the majority of the game. It serves controls to start and stop the Bout
 * edit the score, call Timeouts, and edit Lineups.
 *
 * This page should be designed to fit within a viewport that is 1280px by 585px.
 */
export default function OperatorPage() {
  const [opened, { toggle }] = useDisclosure(true);

  const [activeSeries] = useSeriesPicker();
  const [activeBout, setActiveBout, bouts] = useBoutPicker(activeSeries);
  const { data: rulesets } = useGetAllRulesets();

  return (
    <AppShell {...appShellConfig(opened)}>
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md" wrap="nowrap">
          <Group justify="left" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Title order={5}>NSO Bridge</Title>
          </Group>
          <Group justify="right" wrap="nowrap">
            <BoutPicker
              bouts={bouts}
              activeBout={activeBout}
              onChange={setActiveBout}
            />
            <BoutCreator
              rulesets={rulesets}
              activeSeries={activeSeries}
              onSuccess={setActiveBout}
            />
            <BoutEditor bout={activeBout} />

            <Undoer gap="xs" variant="subtle" wrap="nowrap" />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        <NavLink
          href="#required-for-focus"
          label="Open Scoreboard"
          rightSection={<IconExternalLink color="gray" size={16} />}
          disabled={activeSeries == null}
          onClick={() =>
            window.open(
              window.location.href + "sb?seriesUuid=" + activeSeries!.uuid,
              "_blank",
            )
          }
        />
      </AppShell.Navbar>
      <AppShell.Main h="100vh">
        <Suspense
          fallback={
            <Center h="100%">
              <Loader size="lg" />
            </Center>
          }
        >
          <Group w="100%" justify="center">
            <OperatorInterface bout={activeBout} />
          </Group>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}

// export function Operator2() {
//   // TODO: Simplify this function
//   const { data: activeSeries, refetch: refetchAllSeries } =
//     useSuspenseGetAllSeries({
//       select: (allSeries: Series[]) => allSeries[allSeries.length - 1],
//     });

//   const { data: bouts, isPending: boutsArePending } = useQueries({
//     queries: activeSeries.boutUuids.map((boutUuid: string) => ({
//       queryKey: boutKeys.one(boutUuid),
//       queryFn: () =>
//         localAPI.get<Bout>("bout", {
//           query: { boutUuid },
//         }),
//     })),
//     combine: useCallback(
//       (results: UseQueryResult<Bout, Error>[]) => ({
//         data: results.map((result) => result.data),
//         isPending: results.some((result) => result.isPending),
//       }),
//       [],
//     ),
//   });

//   const [boutUri, setBoutUri] = useState<BoutUri>({
//     boutUuid: activeSeries.activeBoutUuid,
//   });

//   const { data: bout } = useSuspenseBout(boutUri);
//   const { data: ruleset } = useSuspenseGetRuleset(bout);

//   useEffect(() => {
//     if (activeSeries.boutUuids.includes(bout.uuid)) {
//       return;
//     }
//     setBoutUri({
//       boutUuid: activeSeries.boutUuids[activeSeries.boutUuids.length - 1],
//     });
//   }, [bout.uuid, activeSeries.boutUuids]);

//   const activeJamUri = useActiveJamUri(bout);
//   const { data: activeJam } = useSuspenseJam(activeJamUri);

//   const latestJamUri = useLatestJamUri(bout);
//   void useJam(latestJamUri); // Used to prevent UI from blinking

//   const latestTimeoutUri = useLatestTimeoutUri(bout);
//   const { data: latestTimeout, isFetched: timeoutIsFetched } = useTimeout({
//     ...latestTimeoutUri,
//     enabled: bout.timeoutCount > 0,
//     throwOnError: false,
//   });

//   const [opened, { open, close }] = useDisclosure(false);

//   // Get the time since the last Jam or Timeout or null if neither have occurred
//   const lastEventTimestamp: string | null =
//     activeJam.startTimestamp != null
//       ? new Date(
//           Math.max(
//             ...[
//               activeJam.startTimestamp,
//               activeJam.stopTimestamp,
//               latestTimeout?.startTimestamp,
//               latestTimeout?.stopTimestamp,
//             ]
//               .filter((val?: string | null) => val != null)
//               .map((val: string) => new Date(val).getTime()),
//           ),
//         ).toISOString()
//       : null;

//   const setActiveBout = useSetActiveBout({ seriesUuid: activeSeries.uuid });

//   return (
//     <PageShell
//       header={
//         <>
//           <Select
//             withAlignedLabels
//             size="xs"
//             data={bouts
//               .filter((b) => b != null)
//               .map((b) => ({
//                 value: b.uuid,
//                 label: b.teams.map((t) => t.name).join(" vs. "),
//               }))}
//             loading={boutsArePending}
//             value={boutUri.boutUuid}
//             allowDeselect={false}
//             onChange={(boutUuid: string | null) => {
//               if (boutUuid != null) {
//                 setBoutUri({ boutUuid });
//                 setActiveBout.mutate(boutUuid);
//               }
//             }}
//           />
//           <Tooltip withArrow fz="xs" label="Create a Bout">
//             <ActionIcon variant="light" onClick={open}>
//               <IconPlus size={16} />
//             </ActionIcon>
//           </Tooltip>
//           {/* <BoutEditor {...bout} /> */}
//           <Button
//             size="xs"
//             variant="subtle"
//             justify="space-between"
//             rightSection={<IconExternalLink size={16} />}
//             onClick={() =>
//               window.open(
//                 window.location.href + "sb?seriesUuid=" + activeSeries.uuid,
//                 "_blank",
//               )
//             }
//           >
//             Open Scoreboard
//           </Button>
//           &nbsp;
//         </>
//       }
//       navButtons={
//         <Stack>
//           <Box h="100px">
//             <Card withBorder orientation="vertical" fz="h4" p="0">
//               <GameClock
//                 align="center"
//                 p="xs"
//                 activePeriodNum={activeJam.period >= 2 ? 1 : activeJam.period}
//                 activeJamNum={
//                   activeJam.num +
//                   (activeJam.period >= 2 ? bout.jamCounts[1] : 0)
//                 }
//                 isOvertime={activeJam.period >= 2}
//                 {...bout}
//                 {...activeJam}
//                 {...ruleset}
//               />
//               <Divider
//                 orientation="horizontal"
//                 size={bout.state != "jam" ? "xs" : 0}
//               />
//               <Collapse expanded={bout.state != "jam"} bg="yellow.3">
//                 <EventClock
//                   p="xs"
//                   fz="h3"
//                   ta="center"
//                   hideClock={
//                     bout.state == "stopped" ||
//                     bout.state == "final" ||
//                     (bout.state == "lineup" && latestJamUri.jamNum == 0)
//                   }
//                   prefix={eventNames[bout.subState]}
//                   startTimestamp={lastEventTimestamp}
//                   {...bout}
//                 />
//               </Collapse>
//             </Card>
//           </Box>
//           <BoutControl
//             latestJamUri={latestJamUri}
//             state={bout.state}
//             disabled={bout.state == "final"}
//           />

//           <Collapse
//             expanded={activeJamUri.periodNum >= 1 && bout.state == "stopped"}
//           >
//             <EndBoutControl boutUuid={boutUri.boutUuid} />
//           </Collapse>

//           <Collapse
//             expanded={
//               (bout.state == "lineup" || bout.state == "timeout") &&
//               latestJamUri.jamNum > 0
//             }
//           >
//             <JamStopReasonEditor
//               p="xs"
//               stopReason={activeJam.stopReason}
//               jamUri={activeJamUri}
//             />
//           </Collapse>

//           <Collapse expanded={bout.state == "timeout" && timeoutIsFetched}>
//             <TimeoutEditor
//               p="xs"
//               timeoutUri={latestTimeoutUri}
//               teamNum={latestTimeout?.teamNum ?? null}
//               teamIsOfficials={latestTimeout?.teamIsOfficials ?? false}
//               isReview={latestTimeout?.isReview ?? false}
//               isRetained={latestTimeout?.retained ?? false}
//               teamData={bout.teams.map((team: Team) => {
//                 return { label: team.name, value: String(team.num) };
//               })}
//             />
//           </Collapse>
//         </Stack>
//       }
//     >
//       <Modal title="Create New Bout" opened={opened} onClose={close}>
//         <BoutCreatorForm
//           rulesets={[]}
//           series={activeSeries}
//           onSuccess={(newBout: Bout) => {
//             void refetchAllSeries({ cancelRefetch: false }).then(() => {
//               setBoutUri({ boutUuid: newBout.uuid });
//               close();
//             });
//           }}
//         />
//       </Modal>

//       <Stack gap="sm" align="stretch" w="100%">
//         <Group justify="space-around" gap="lg">
//           {bout.teams.map((team: Team, i: number) => {
//             const teamJam = activeJam.teamJams.find(
//               (tj: TeamJam) => tj.teamNum == team.num,
//             );

//             const lead = teamJam?.events.some((event) => event.lead) ?? false;
//             const lost = teamJam?.events.some((event) => event.lost) ?? false;
//             const starPass =
//               teamJam?.events.some((event) => event.starPass) ?? false;
//             const numTrips =
//               teamJam?.events.reduce<number>(
//                 (sum: number, event: TripEvent) =>
//                   sum + Number(event.passes != null),
//                 0,
//               ) ?? 0;

//             return (
//               <Card withBorder key={team.num} w="350px" px="0">
//                 <Stack align="stretch" w="350px">
//                   <Title ta="center" fz="h3">
//                     {team.name}
//                   </Title>
//                   <Center>
//                     <TeamScore
//                       reverse={!!(i % 2)}
//                       aside={
//                         <TimeoutsLeft
//                           timeoutIsActive={
//                             latestTimeout != null &&
//                             isRunning(latestTimeout) &&
//                             latestTimeout.teamNum === team.num
//                           }
//                           isReview={latestTimeout?.isReview ?? false}
//                           h={13}
//                           {...team}
//                           {...ruleset}
//                         />
//                       }
//                       lead={lead}
//                       lost={lost}
//                       starPass={starPass}
//                       noInitial={numTrips == 0}
//                       textSize={20}
//                       {...team}
//                     />
//                   </Center>

//                   {teamJam != null && (
//                     <Fieldset
//                       variant="unstyled"
//                       disabled={
//                         activeJam.startTimestamp == null ||
//                         bout.state == "final"
//                       }
//                     >
//                       <Stack gap="xs">
//                         <Divider
//                           label="Edit Jammer"
//                           variant="dashed"
//                           w="100%"
//                         />
//                         <JammerStateControl
//                           justify="space-between"
//                           mx="md"
//                           boutUuid={activeJam.boutUuid}
//                           periodNum={activeJam.period}
//                           jamNum={activeJam.num}
//                           lead={lead}
//                           lost={lost}
//                           starPass={starPass}
//                           leadIsDeclared={teamJam.events.some(
//                             (event) => event.lead,
//                           )}
//                           {...teamJam}
//                           {...ruleset}
//                         />
//                         <Divider label="Add Trips" variant="dashed" w="100%" />
//                         <JammerTripControl
//                           teamJamUri={{ teamNum: team.num, ...activeJamUri }}
//                           showInitial={numTrips == 0}
//                           numPasses={ruleset.pointsPerTrip}
//                           {...teamJam}
//                           {...ruleset}
//                         />
//                         <ResponsiveScroller m="0" h="100px">
//                           {teamJam.events
//                             .filter(
//                               (tripEvent: TripEvent) =>
//                                 tripEvent.passes != null,
//                             )
//                             .map((tripEvent: TripEvent, i: number) => (
//                               <JammerTrip
//                                 w="80px"
//                                 key={i}
//                                 tripIndex={i}
//                                 teamJamUri={{
//                                   teamNum: teamJam.teamNum,
//                                   ...activeJamUri,
//                                 }}
//                                 {...tripEvent}
//                                 {...ruleset}
//                               />
//                             ))}
//                         </ResponsiveScroller>
//                       </Stack>
//                     </Fieldset>
//                   )}
//                   {/* TODO: Add lineup editors */}
//                 </Stack>
//               </Card>
//             );
//           })}
//         </Group>
//       </Stack>
//     </PageShell>
//   );
// }
