import BoutControlButtons from "@/features/bout-control/bout-control-buttons";
import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamJamView from "@/features/team-jam-vew/team-jam-view";
import TeamView from "@/features/team-view/team-view";
import { useSuspenseBout } from "@/hooks/use-bout";
import { useJam, useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { useSuspenseAllSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import { Timeout } from "@/lib/game/timeouts";
import { redo, undo } from "@/lib/history";
import { BoutContext, JamContext, RulesetContext } from "@/utils/contexts";
import {
  AppShell,
  Burger,
  Container,
  Grid,
  MantineProvider,
  Stack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    if (event.key === "z") {
      void undo();
    }
    if (event.key === "y") {
      void redo();
    }
  }
});

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
          >
            <AppShell.Header>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
            </AppShell.Header>

            <AppShell.Navbar>{/* TODO: Navbar */}</AppShell.Navbar>

            <AppShell.Main>
              <Suspense fallback={"Loading..."}>
                <Main />
              </Suspense>
            </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}

function Main() {
  usePrefetchServerTime();

  const { data: allSeries } = useSuspenseAllSeries();

  const series: Series = allSeries[0];
  const { data: bout } = useSuspenseBout(
    series.boutUuids[series.activeBoutIndex ?? series.boutUuids.length - 1],
  );

  // Eagerly query the latest Jam and Timeout to avoid suspending
  void useJam(bout, ...bout.getLatestJamNum());

  // Fetch Jam data
  const [periodNum, jamNum] = bout.getActiveOrLatestJamNum();
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  const timeout = new Timeout(); // FIXME

  const { data: ruleset } = useSuspenseRuleset(bout);
  return (
    <BoutContext value={bout}>
      <RulesetContext value={ruleset}>
        <Container>
          <Stack>
            <BoutControlButtons bout={bout} />
            <Grid columns={bout.teams.length} align="center">
              <JamContext value={jam}>
                {bout.teams.map((team: Team, i: number) => (
                  <Grid.Col key={i} span={1}>
                    <Stack>
                      <TeamView
                        team={team}
                        timeout={timeout}
                        ruleset={ruleset}
                      />
                    </Stack>
                  </Grid.Col>
                ))}
              </JamContext>
            </Grid>
            <BoutStateView
              bout={bout}
              activeOrLatestJam={jam}
              activeTimeout={timeout}
              ruleset={ruleset}
            />
            <Grid columns={bout.teams.length} align="center">
              <JamContext value={jam}>
                {bout.teams.map((team: Team, i: number) => (
                  <Grid.Col key={i} span={1}>
                    <Stack>
                      <TeamJamView jam={jam} team={team} />
                    </Stack>
                  </Grid.Col>
                ))}
              </JamContext>
            </Grid>
          </Stack>
        </Container>
      </RulesetContext>
    </BoutContext>
  );
}
