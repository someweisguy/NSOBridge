import Clock from "@/components/clock";
import { TeamComponent } from "@/components/team-component";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import useServerOffset from "@/hooks/use-server-offset";
import { Bout, BoutContext } from "@/lib/bout";
import queryClient from "@/lib/cache";
import FitScreen from "@fit-screen/react";
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
  void useServerOffset(); // Prefetch
  const bout = useBout(1);
  const context = useBoutContext(1);

  return (
    <div className="flex flex-col flex-nowrap grid-flow-row h-screen size-screen">
      <div className="justify-stretch items-stretch grid just basis-1/2 shrink-0 grow-0">
        {/* Primary Information (Team Info) */}
        <TeamComponent bout={bout} context={context} />
      </div>
      <div className="place-content-center text-center basis-1/8 shrink-0 grow-0">
        {/* Tertiary Information (Game State) */}
        <BoutTertiaryInformation bout={bout} />
      </div>
      <div className="justify-stretch items-stretch grid basis-3/8 shrink-0">
        {/* Secondary Information (Clocks, etc.) */}
        <BoutTimeInformation bout={bout} context={context} />
      </div>
    </div>
  );
}

function IntermissionStatus({ bout }: { bout: Bout }) {
  const numPeriods = bout.jamCounts.length;
  let content = "";
  if (numPeriods === 0) {
    if (bout.expectedStartTimestamp == null) {
      content = "Starting Soon";
    } else {
      content = "Starting in ";
    }
  } else if (numPeriods === 1) {
    content = "Halftime";
  } else if (!bout.isFinal) {
    content = "Unofficial Score";
  } else {
    content = "Final Score";
  }

  // FIXME
  return (
    <div className="items-center grid m-2 h-full text-8xl text-center">
      {content}{" "}
      {bout.expectedStartTimestamp && (
        <Clock startTimestamp={bout.expectedStartTimestamp} />
      )}
    </div>
  );
}

function BoutTimeInformation({
  bout,
  context,
}: {
  bout: Bout;
  context: BoutContext;
}) {
  if (bout.activeJam === null) {
    return <IntermissionStatus bout={bout} />;
  }

  let displayPeriod = bout.activeJam.period;
  let displayJam = bout.activeJam.num;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += bout.jamCounts[1];
  }

  return (
    <div className="flex justify-evenly items-center text-9xl text-center align-middle">
      <div className="bg-red w-full text-7xl text-center">
        {bout.jamCounts.length > 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 w-full">
        <h1 className="text-center">P{displayPeriod + 1}</h1>
        <h1 className="text-center">J{displayJam + 1}</h1>
      </div>
      <div className="w-full text-7xl text-center">
        {!bout.activeJam.hasStarted() || bout.activeJam.isRunning() ? (
          <Clock {...bout.activeJam} alarm={context.jamDuration} />
        ) : (
          <Clock
            startTimestamp={bout.activeJam.stopTimestamp}
            alarm={context.lineupDuration}
          />
        )}
      </div>
    </div>
  );
}

function BoutTertiaryInformation({ bout }: { bout: Bout }) {
  const boutState = bout.getState();
  if (["timeout", "lineup"].includes(boutState)) {
    let content = "";
    if (boutState == "timeout") {
      // TODO: Implement Team Timeout and Official Review
      content = "Timeout";
    } else if (boutState == "lineup") {
      content = "Lineup";
    }

    return <h1 className="text-7xl">{content}</h1>;
  }

  // TODO: Implement Jam state
  return <></>;
}
