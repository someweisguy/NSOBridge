import BoutController from "@/features/bout-controller/components/bout-controller";
import BoutCreator from "@/features/bout-editor/components/bout-creator";
import BoutEditor from "@/features/bout-editor/components/bout-editor";
import BoutPicker from "@/features/bout-editor/components/bout-picker";
import Undoer from "@/features/bout-editor/components/undoer";
import TeamJamOperator from "@/features/team-jam-controller/components/team-jam-operator";
import useBoutPicker from "@/hooks/game/use-bout-picker";
import { useGetAllRulesets } from "@/hooks/game/use-ruleset";
import useSeriesPicker from "@/hooks/game/use-series-picker";
import { Team } from "@/types/bout";
import {
  AppShell,
  AppShellProps,
  Burger,
  Card,
  Center,
  Group,
  Loader,
  NavLink,
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
        {activeBout != null ? (
          <Group w="100%" justify="center">
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
                <BoutController bout={activeBout} />
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
                  {activeBout.teams.map((team: Team, i: number) => (
                    <TeamJamOperator
                      key={team.uuid}
                      bout={activeBout}
                      team={team}
                      reverse={!!(i % 2)}
                    />
                  ))}
                </Group>
              </Suspense>
            </Card>
          </Group>
        ) : (
          <Center h="100%">
            <Loader size="lg" />
          </Center>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
