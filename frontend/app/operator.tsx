import BoutClock from "@/features/bout-controller/components/bout-clock";
import BoutDirector from "@/features/bout-controller/components/bout-director";
import BoutCreator from "@/features/bout-editor/components/bout-creator";
import BoutEditor from "@/features/bout-editor/components/bout-editor";
import BoutPicker from "@/features/bout-editor/components/bout-picker";
import JammerController from "@/features/team-jam-controller/components/jammer-controller";
import JamStopReasonEditor from "@/features/bout-controller/components/stop-reason-editor";
import TeamScore from "@/features/team-jam-controller/components/team-score";
import TimeoutEditor from "@/features/bout-controller/components/timeout-editor";
import TripAdder from "@/features/team-jam-controller/components/trip-adder";
import TripController from "@/features/team-jam-controller/components/trip-controller";
import Undoer from "@/features/bout-editor/components/undoer";
import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import { useLatestJam } from "@/hooks/game/use-latest-jam";
import useLatestTimeout from "@/hooks/game/use-latest-timeout";
import useBoutPicker from "@/hooks/game/use-bout-picker";
import {
  useGetAllRulesets,
  useSuspenseGetRuleset,
} from "@/hooks/game/use-ruleset";
import useSeriesPicker from "@/hooks/game/use-series-picker";
import useSuspendIfNullable from "@/hooks/use-suspend-if-nullable";
import { Bout, Team } from "@/types/bout";
import {
  AppShell,
  AppShellProps,
  Burger,
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  Loader,
  NavLink,
  Stack,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink } from "@tabler/icons-react";
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

function OperatorInterface({ bout }: { bout: Bout | undefined }) {
  useSuspendIfNullable(bout);

  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);
  void useLatestJam(bout); // Prefetch to avoid UI blinking
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  return (
    <Card
      withBorder
      orientation="horizontal"
      w="fit-content"
      maw="100%"
      h="fit-content"
      m="md"
      shadow="lg"
    >
      <Card.Section withBorder>
        <Stack mb="lg" w={225}>
          <Stack gap="0" w="100%">
            <BoutClock bout={bout} />
            <Divider />
          </Stack>
          <Stack justify="start" align="stretch" px="xs">
            <BoutDirector bout={bout} p="xs" />
            <Collapse expanded={activeJam.stopTimestamp != null}>
              <JamStopReasonEditor jam={activeJam} p="xs" />
            </Collapse>
            <Collapse
              expanded={bout.state == "timeout" && latestTimeout != null}
            >
              <TimeoutEditor timeout={latestTimeout!} p="xs" />
            </Collapse>
          </Stack>
        </Stack>
      </Card.Section>
      <Suspense fallback={<Loader />}>
        <Group
          grow
          justify="space-around"
          align="start"
          wrap="nowrap"
          px="lg"
          gap="xl"
        >
          {bout.teams.map((team: Team, i: number) => (
            <Stack key={team.uuid} justify="start" align="center">
              <TeamScore bout={bout} team={team} reverse={!!(i % 2)} />
              <JammerController
                justify="space-between"
                mx="md"
                jam={activeJam}
                team={team}
                {...ruleset}
              />
              <TripAdder team={team} px="lg" w="100%" {...ruleset} />
              <TripController
                jam={activeJam}
                team={team}
                draggable={false}
                w="22rem"
                h="4rem"
                {...ruleset}
              />
            </Stack>
          ))}
        </Group>
      </Suspense>
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
  // TODO: cache the navbar open state
  const [opened, { toggle }] = useDisclosure(false);

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
