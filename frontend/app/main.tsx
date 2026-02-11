import BoutPicker from "@/components/bout-picker";
import BoutProvider from "@/components/bout-provider";
import JamProvider from "@/components/jam-provider";
import TeamProvider from "@/components/team-provider";
import BoutControlButtons from "@/features/bout-control/bout-control-buttons";
import PrimaryBoutStatus from "@/features/bout/components/primary-bout-status";
import { SecondaryBoutStatus } from "@/features/bout/components/secondary-bout-status";
import TeamJamView from "@/features/team-jam-vew/team-jam-view";
import TeamBoutScore from "@/features/team/components/bout-score";
import TeamJamScore from "@/features/team/components/jam-score";
import TeamName from "@/features/team/components/team-name";
import TeamTimeoutBar from "@/features/team/components/timeout-bar";
import { useSuspenseAllBouts, useSuspenseBout } from "@/hooks/use-bout";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import {
  AppShell,
  Burger,
  Flex,
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
  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();

  return (
    <BoutProvider bout={bout}>
      <Stack align="stretch" justify="flex-start">
        {/* Bout State control */}
        <BoutControlButtons bout={bout} />

        {/* Team information */}
        <SimpleGrid cols={bout.teams.length}>
          {bout.teams.map((team: Team, i: number) => (
            <TeamProvider key={i} team={team}>
              <Stack justify="center">
                <TeamName ta="center" fw="bolder" size="36pt" />
                <Flex
                  direction={i % 2 == 0 ? "row" : "row-reverse"}
                  align="center"
                  justify="center"
                  gap="xl"
                >
                  <TeamTimeoutBar size={24} />
                  <TeamBoutScore fw="bold" w={150} ta="center" size="48pt" />
                  <TeamJamScore size="24pt" />
                </Flex>
              </Stack>
            </TeamProvider>
          ))}
        </SimpleGrid>

        {/* Bout State View */}
        <SimpleGrid>
          <PrimaryBoutStatus
            withClock
            justify="center"
            align="center"
            size="36pt"
          />
          <SecondaryBoutStatus withClock ta="center" size="24pt" />
        </SimpleGrid>

        {/* TeamJam score editors */}
        <Suspense fallback={"Loading..."}>
          <JamProvider
            bout={bout}
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
          >
            <SimpleGrid cols={bout.teams.length}>
              {bout.teams.map((team: Team, i: number) => (
                <TeamJamView key={i} bout={bout} team={team} />
              ))}
            </SimpleGrid>
          </JamProvider>
        </Suspense>

        {/* Lineup editors */}
        {/* TODO */}
      </Stack>
    </BoutProvider>
  );
}
