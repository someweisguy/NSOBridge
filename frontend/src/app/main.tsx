import Clock from "@/components/clock";
import JamNumView from "@/components/jam-num-view";
import TeamView from "@/components/team-view";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import { Team } from "@/lib/bout";
import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import useServerOffset from "@/hooks/use-server-offset";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={"Loading..."}>
          <Test />
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Test() {
  void useServerOffset();  // Prefetch
  const bout = useBout(1);
  const context = useBoutContext(1);

  useEffect(() => {
    setTimeout(() => {
      if (!bout.activeJam) {
        console.log("Starting Bout");
        void bout.start();
      } else if (!bout.clock.isRunning()) {
        void bout.startJam();
      }
    }, 1000);
  }, [bout]);

  return (
    <>
      <div className="place-content-around grid grid-flow-col">
        {bout.teams.map((team: Team, index: number) => (
          <TeamView key={index} team={team} context={context} />
        ))}
      </div>
      <BoutTimeInformation />
    </>
  );
}

function BoutTimeInformation() {
  const bout = useBout(1);
  const context = useBoutContext(1);

  if (bout.activeJam === null) {
    const numPeriods = bout.jamCounts.length;
    let copy = "";
    if (numPeriods === 0) {
      copy = "Starting Soon";
    } else if (numPeriods === 1) {
      copy = "Halftime";
    }

    return <div>{copy}</div>;
  }

  return (
    <div className="gap-3 grid grid-flow-col">
      <Clock {...bout.clock} />
      <JamNumView {...bout.activeJam} />
      <Clock {...bout.activeJam} alarm={context.jamDuration} />
    </div>
  );
}
