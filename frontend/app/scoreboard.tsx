import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import {
  useBout,
  useLatestJamIndex,
  useLatestTimeoutIndex,
} from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useSeries } from "@/hooks/use-series";
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
            <Test />
          </FitScreen>
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Test() {
  const { data: series } = useSeries(0);
  const { data: bout } = useBout(series, 0);
  const { data: activeJam } = useJam(bout, ...useLatestJamIndex(bout));
  const { data: latestTimeout } = useTimeout(bout, useLatestTimeoutIndex(bout));

  return (
    <div className="flex flex-col flex-nowrap grid-flow-row h-screen size-screen">
      <div className="justify-stretch items-stretch grid grid-flow-col basis-1/2 shrink-0 grow-0">
        {/* Primary Information (Team Info) */}
        {bout.teams.map((team: Team, i: number) => (
          <TeamView key={i} bout={bout} team={team} timeout={latestTimeout} />
        ))}
      </div>
      <div className="justify-stretch items-stretch grid basis-1/2 shrink-0">
        {/* Secondary Information (Clocks, etc.) */}
        <BoutStateView
          bout={bout}
          activeJam={activeJam}
          latestTimeout={latestTimeout}
        />
      </div>
    </div>
  );
}
