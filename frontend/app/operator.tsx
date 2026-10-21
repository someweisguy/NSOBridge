import { appShellConfig } from "@/configs/app-shell";
import BoutCreator from "@/features/bout-editor/components/bout-creator";
import BoutEditor from "@/features/bout-editor/components/bout-editor";
import BoutPicker from "@/features/bout-editor/components/bout-picker";
import useBoutPicker from "@/features/bout-editor/hooks/use-bout-picker";
import useSeriesPicker from "@/features/bout-editor/hooks/use-series-picker";
import BoutOperator from "@/features/bout-operator/components/bout-operator";
import TeamJamOperator from "@/features/team-jam-operator/components/team-jam-operator";
import Undoer from "@/features/undo/components/undoer";
import { Team } from "@/types/bout";
import {
  AppShell,
  Burger,
  Card,
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
  const [activeBout, setActiveBoutUuid, boutPickerData] =
    useBoutPicker(activeSeries);

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
              activeBoutUuid={activeBout?.uuid}
              data={boutPickerData}
              onChange={setActiveBoutUuid}
            />
            <BoutCreator
              activeSeriesUuid={activeSeries?.uuid}
              onSuccess={setActiveBoutUuid}
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
        <Group w="100%" h="100%" justify="center" align="start">
          {activeBout != null ? (
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
                <BoutOperator bout={activeBout} />
              </Card.Section>
              <Group
                grow
                justify="space-around"
                align="start"
                wrap="nowrap"
                px="lg"
                gap="xl"
              >
                {/* TODO: Suspense fallback should be Skeleton */}
                <Suspense fallback={<Loader size="xs" />}>
                  {activeBout.teams.map((team: Team, i: number) => (
                    <TeamJamOperator
                      key={team.uuid}
                      team={team}
                      reverse={!!(i % 2)}
                    />
                  ))}
                </Suspense>
              </Group>
            </Card>
          ) : (
            <Loader size="lg" style={{ alignSelf: "center" }} />
          )}
        </Group>
      </AppShell.Main>
    </AppShell>
  );
}
