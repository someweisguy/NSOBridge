import BoutStateView from "@/components/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import { useAllBouts, useSuspenseBout } from "@/hooks/use-bout";
import { useJam, useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { useSuspenseTimeout } from "@/hooks/use-timeout";
import queryClient from "@/lib/cache";
import { Bout, Team } from "@/lib/game/bouts";
import FitScreen from "@fit-screen/react";
import { Center, Grid, MantineProvider, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={"Loading..."}>
            <FitScreen waitTime={25} mode="fit">
              <Scoreboard />
            </FitScreen>
          </Suspense>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}

function Scoreboard() {
  usePrefetchServerTime();

  const { data: allBouts } = useAllBouts();

  useEffect(() => {
    for (const bout of allBouts) {
      queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
    }
  }, [allBouts]);

  const { data: bout } = useSuspenseBout(allBouts[0].uuid);

  // Eagerly query the latest Jam and Timeout to avoid suspending
  void useJam(bout, ...bout.getLatestJamNum());

  const { data: ruleset } = useSuspenseRuleset(bout);

  // Fetch Jam data
  const jamIndex = bout.getActiveOrLatestJamNum();
  const [periodNum, jamNum] = jamIndex;
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  // Fetch Timeout data
  const timeoutIndex = bout.getActiveOrLatestTimeoutIndex();
  const { data: timeout } = useSuspenseTimeout(bout, timeoutIndex);

  return (
    <Stack>
      <Grid columns={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Grid.Col key={i} span={1}>
            <TeamView
              bout={bout}
              timeout={timeout}
              ruleset={ruleset}
              team={team}
            />
          </Grid.Col>
        ))}
      </Grid>
      {/* TODO: Lead Jam Status */}
      <Center>
        <BoutStateView
          bout={bout}
          activeOrLatestJam={jam}
          activeTimeout={timeout}
          ruleset={ruleset}
        />
      </Center>
    </Stack>
  );
}
