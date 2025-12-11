import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import useBout from "@/hooks/use-bout";
import queryClient from "@/lib/cache";
import { Team } from "@/types/game";
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
  const bout = useBout(1);

  return (
    <div className="flex flex-col flex-nowrap grid-flow-row h-screen size-screen">
      <div className="justify-stretch items-stretch grid grid-flow-col basis-1/2 shrink-0 grow-0">
        {/* Primary Information (Team Info) */}
        {bout.teams.map((team: Team, i: number) => (
          <TeamView key={i} team={team} />
        ))}
      </div>
      <div className="justify-stretch items-stretch grid basis-1/2 shrink-0">
        {/* Secondary Information (Clocks, etc.) */}
        <BoutStateView bout={bout} />
      </div>
    </div>
  );
}
