import Button from "@/components/button";
import Clock from "@/components/clock";
import { TeamComponent } from "@/components/team-component";
import useBout from "@/features/game/bouts/hooks/use-bout";
import useBoutContext from "@/features/game/bouts/hooks/use-bout-context";
import { Bout, createBout } from "@/features/game/bouts/types";
import useCurrentOrUpcomingJam from "@/features/game/jams/hooks/use-current-or-upcoming-jam";
import useSeries from "@/features/game/series/hooks/use-series";
import { Series } from "@/features/game/series/types";
import useServerOffset from "@/hooks/use-server-offset";
import queryClient from "@/lib/cache";
import { redo, undo } from "@/lib/history";
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

  const series: Series = useSeries(1);
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
        <Button onClick={() => void bout.beginPeriod()}>Start Period</Button>
        <Button onClick={() => void bout.startJam()}>Start Jam</Button>
        <Button onClick={() => void bout.stopJam()}>Stop Jam</Button>
        <Button onClick={() => void bout.startTimeout()}>Call Timeout</Button>
        <Button onClick={() => void bout.stopTimeout()}>End Timeout</Button>
        <Button onClick={() => void bout.endPeriod()}>End Period</Button>
        <Button onClick={createBoutCallback}>New Bout</Button>

        <Button onClick={() => void undo()}>Undo</Button>
        <Button onClick={() => void redo()}>Redo</Button>
      </div>
    </div>
  );
}

function BoutTimeInformation() {
  const bout = useBout(1);
  const context = useBoutContext(1);

  const jam = useCurrentOrUpcomingJam(bout);

  if (!bout.isRunning) {
    let copy = "Starting Soon";
    if (bout.isFinal) {
      copy = "Final Score";
    } else if (jam.period > 1) {
      copy = "Unofficial Score";
    } else if (jam.period == 1) {
      copy = "Halftime";
    }

    return (
      <div className="items-center grid m-2 h-full text-8xl text-center">
        {copy}
      </div>
    );
  }

  let displayPeriod = jam.period;
  let displayJam = jam.num;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += bout.jamCounts[1];
  }

  return (
    <div className="flex justify-evenly items-center text-9xl text-center align-middle">
      <div className="bg-red w-full text-7xl text-center">
        {jam.period == 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 w-full">
        <h1 className="text-center">P{displayPeriod + 1}</h1>
        <h1 className="text-center">J{displayJam + 1}</h1>
      </div>
      <div className="w-full text-7xl text-center">
        {!jam.hasStarted() || jam.isRunning() ? (
          <Clock {...jam} alarm={context.jamDuration} />
        ) : (
          <Clock
            startTimestamp={jam.stopTimestamp}
            alarm={context.lineupDuration}
          />
        )}
      </div>
    </div>
  );
}
