import BoutStateView from "@/components/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import { useBout, usePrefetchBoutData } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useRuleset } from "@/hooks/use-ruleset";
import { useSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { useTimeout } from "@/hooks/use-timeout";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import FitScreen from "@fit-screen/react";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={"Loading..."}>
          <FitScreen waitTime={25} mode="fit">
            <Scoreboard />
          </FitScreen>
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Scoreboard() {
  usePrefetchServerTime();

  const { data: series } = useSeries(0);
  const { data: bout } = useBout(series);
  usePrefetchBoutData(bout);

  const { data: ruleset } = useRuleset(bout);

  // Fetch Jam data
  const jamIndex = bout.getActiveOrLatestJamIndex();
  const [periodNum, jamNum] = jamIndex;
  const { data: jam } = useJam(bout, periodNum, jamNum);

  // Fetch Timeout data
  const timeoutIndex = bout.getActiveOrLatestTimeoutIndex();
  const { data: timeout } = useTimeout(bout, timeoutIndex);

  return (
    <div className="flex flex-col flex-nowrap grid-flow-row h-screen size-screen">
      <div className="justify-stretch items-stretch grid grid-flow-col basis-1/2 shrink-0 grow-0">
        {/* Primary Information (Team Info) */}
        {bout.teams.map((team: Team, i: number) => (
          <TeamView
            key={i}
            bout={bout}
            team={team}
            timeout={timeout}
            ruleset={ruleset}
          />
        ))}
      </div>
      <div className="justify-stretch items-stretch grid basis-1/2 shrink-0">
        {/* Secondary Information (Clocks, etc.) */}
        <BoutStateView
          bout={bout}
          activeJam={jam}
          latestTimeout={timeout}
          ruleset={ruleset}
        />
      </div>
    </div>
  );
}
