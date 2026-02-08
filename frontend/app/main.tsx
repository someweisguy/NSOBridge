import BoutPicker from "@/components/bout-picker";
import JamProvider from "@/components/jam-provider";
import RulesetProvider from "@/components/ruleset-provider";
import TeamProvider from "@/components/team-provider";
import BoutControlButtons from "@/features/bout-control/bout-control-buttons";
import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamJamView from "@/features/team-jam-vew/team-jam-view";
import TeamView from "@/features/team-view/team-view";
import { useSuspenseAllBouts, useSuspenseBout } from "@/hooks/use-bout";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import {
  AppShell,
  Burger,
  MantineProvider,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useState } from "react";
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

  const { data: bouts } = useSuspenseAllBouts();
  const [boutUuid, setBoutUuid] = useState(bouts[bouts.length - 1].uuid);

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

            <AppShell.Navbar>
              <BoutPicker onChange={(uuid: string) => setBoutUuid(uuid)} />
              {/* TODO: Navbar */}
            </AppShell.Navbar>

            <AppShell.Main>
              <Suspense fallback={"Loading..."}>
                <Main boutUuid={boutUuid} />
              </Suspense>
            </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}

function Main({ boutUuid }: { boutUuid: string }) {
  usePrefetchServerTime();

  const { data: bout } = useSuspenseBout(boutUuid);

  // // Eagerly query the latest Jam and Timeout to avoid suspending
  // void useJam(bout, ...bout.getLatestJamNum());

  // Fetch Jam data
  const [periodNum, jamNum] = bout.getActiveOrLatestJamNum();

  return (
    <RulesetProvider bout={bout}>
      <Stack align="stretch" justify="flex-start">
        <BoutControlButtons bout={bout} />
        <SimpleGrid cols={bout.teams.length}>
          {bout.teams.map((team: Team, i: number) => (
            <TeamProvider key={i} team={team}>
              <TeamView bout={bout} />
            </TeamProvider>
          ))}
        </SimpleGrid>
        <BoutStateView bout={bout} />
        <JamProvider bout={bout} periodNum={periodNum} jamNum={jamNum}>
          <SimpleGrid cols={bout.teams.length}>
            {bout.teams.map((team: Team, i: number) => (
              <TeamJamView key={i} bout={bout} team={team} />
            ))}
          </SimpleGrid>
        </JamProvider>
      </Stack>
    </RulesetProvider>
  );
}
