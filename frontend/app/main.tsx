import Button from "@/components/button";
import Clock from "@/components/clock";
import { TeamComponent } from "@/components/team-component";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import useSeries from "@/hooks/use-series";
import useServerOffset from "@/hooks/use-server-offset";
import { Bout, createBout } from "@/lib/bout";
import queryClient from "@/lib/cache";
import { Series } from "@/lib/series";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  StrictMode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { redo, undo } from "@/lib/history";

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
  void useServerOffset(); // Prefetch
  const [boutIndex, setBoutIndex] = useState(0);
  const goToNextBout = useRef(false);

  const series: Series = useSeries(0);
  if (series.bouts.length == 0) {
    // TODO: Go to Bout creation page
    throw new Error("This Series does not have any Bouts");
  }
  const bout: Bout = useBout(series.bouts[boutIndex].id);
  const context = useBoutContext(series.bouts[boutIndex].id);

  useEffect(() => {
    if (goToNextBout.current && series.bouts.length > boutIndex + 1) {
      goToNextBout.current = false;
      setBoutIndex((i) => i + 1);
    }
  }, [series, boutIndex]);

  const createBoutCallback = useCallback(() => {
    const rosterIds = bout.teams.map((t) => t.rosterId);
    goToNextBout.current = true;
    void createBout(rosterIds);
  }, [bout]);

  return (
    <div className="">
      <TeamComponent bout={bout} context={context} />
      <BoutTimeInformation />
      <div className="place-content-around grid grid-flow-col">
        <Button onClick={() => void bout.setupTrack()}>Start Period</Button>
        <Button onClick={() => void bout.startJam()}>Start Jam</Button>
        <Button onClick={() => void bout.stopJam()}>Stop Jam</Button>
        <Button onClick={() => void bout.callTimeout()}>Call Timeout</Button>
        <Button onClick={() => void bout.endTimeout()}>End Timeout</Button>
        <Button onClick={() => void bout.clearTrack()}>End Period</Button>
        <Button onClick={createBoutCallback}>New Bout</Button>
        <Button
          onClick={() => {
            const now = new Date();
            void bout.setExpectedStart(
              new Date(now.setMinutes(now.getMinutes() + 30)),
            );
          }}
        >
          Set Timer
        </Button>
        <Button onClick={() => void undo()}>Undo</Button>
        <Button onClick={() => void redo()}>Redo</Button>
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

    return (
      <div className="items-center grid m-2 h-full text-8xl text-center">
        {copy}
      </div>
    );
  }

  let displayPeriod = bout.activeJam.period;
  let displayJam = bout.activeJam.jam;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += bout.jamCounts[1];
  }

  return (
    <div className="flex justify-around items-center text-9xl text-center align-middle">
      <div className="bg-red text-7xl text-center">
        {bout.jamCounts.length > 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 grow">
        <h1 className="text-center">P{displayPeriod + 1}</h1>
        <h1 className="text-center">J{displayJam + 1}</h1>
      </div>
      <div className="text-7xl text-center">
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
