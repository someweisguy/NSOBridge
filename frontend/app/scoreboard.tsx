import Clock from "@/components/clock";
import JamNumView from "@/components/jam-num-view";
import { PlainTeamComponent } from "@/components/team-component";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import useServerOffset from "@/hooks/use-server-offset";
import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import FitScreen from "@fit-screen/react";

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
  void useServerOffset(); // Prefetch
  const bout = useBout(1);
  const context = useBoutContext(1);

  return (
    <div className="flex flex-col flex-nowrap gap-4 grid-flow-row h-screen size-screen">
      <div className="place-content-center bg-red-400 text-center basis-1/2 shrink-0 grow-0">
        {/* Primary Information (Team Info) */}
        <PlainTeamComponent bout={bout} context={context} />
      </div>
      <div className="place-content-center bg-blue-400 text-center basis-1/8 shrink-0 grow-0">
        Tertiary Information (Game State)
      </div>
      <div className="place-content-center bg-green-400 text-center basis-3/8 shrink-0">
        {/* Secondary Information (Clocks, etc.) */}
        <BoutTimeInformation />
      </div>
    </div>
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
    } else if (!bout.isFinal) {
      copy = "Unofficial Score";
    } else {
      copy = "Final Score";
    }

    return <div className="m-2 text-center">{copy}</div>;
  }

  return (
    <div className="gap-3 grid grid-flow-col">
      {bout.jamCounts.length > 2 ? "OT" : <Clock {...bout.clock} />}
      <JamNumView {...bout.activeJam} jamCounts={bout.jamCounts} />
      {!bout.activeJam.hasStarted() || bout.activeJam.isRunning() ? (
        <Clock {...bout.activeJam} alarm={context.jamDuration} />
      ) : (
        <Clock
          startTimestamp={bout.activeJam.stopTimestamp}
          alarm={context.lineupDuration}
        />
      )}
    </div>
  );
}
