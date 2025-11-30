import Button from "@/components/button";
import Clock from "@/components/clock";
import useBout from "@/hooks/use-bout";
import useJam from "@/hooks/use-jam";
import useRuleset from "@/hooks/use-ruleset";
import useSeries from "@/hooks/use-series";
import queryClient from "@/lib/cache";
import {
  beginPeriod,
  createBout,
  endPeriod,
  startJam,
  startTimeout,
  stopJam,
  stopTimeout,
} from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { Bout, Series, Team } from "@/types/game";
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
import TeamView from "@/components/team-view";

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
  const [boutIndex, setBoutIndex] = useState(0);
  const goToNextBout = useRef(false);

  const series: Series = useSeries(1);
  if (series.boutIds.length == 0) {
    // TODO: Go to Bout creation page
    throw new Error("This Series does not have any Bouts");
  }
  const bout: Bout = useBout(series.boutIds[boutIndex]);

  useEffect(() => {
    if (goToNextBout.current && series.boutIds.length > boutIndex + 1) {
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
      <div className="justify-around grid grid-flow-col">
        {bout.teams.map((team: Team, i: number) => (
          <TeamView key={i} team={team} />
        ))}
      </div>
      <BoutTimeInformation />
      <div className="place-content-around grid grid-flow-col">
        <Button onClick={() => void beginPeriod(bout.id)}>Start Period</Button>
        <Button onClick={() => void startJam(bout.id)}>Start Jam</Button>
        <Button onClick={() => void stopJam(bout.id)}>Stop Jam</Button>
        <Button onClick={() => void startTimeout(bout.id)}>Call Timeout</Button>
        <Button onClick={() => void stopTimeout(bout.id)}>End Timeout</Button>
        <Button onClick={() => void endPeriod(bout.id)}>End Period</Button>
        <Button onClick={createBoutCallback}>New Bout</Button>

        <Button onClick={() => void undo()}>Undo</Button>
        <Button onClick={() => void redo()}>Redo</Button>
      </div>
    </div>
  );
}

function BoutTimeInformation() {
  const bout = useBout(1);
  const context = useRuleset(1);

  let periodNum = 0;
  let jamNum = 0;
  for (const i of bout.jamCounts) {
    if (i > 0) {
      jamNum = i - 1;
      break;
    }
    periodNum++;
  }

  const jam = useJam(bout, periodNum, jamNum);

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

  let currentPeriodNum = jam.period;
  let currentJamNum = jam.num;

  // Overtime Jams should be considered a continuation of the second half
  if (currentPeriodNum >= 2) {
    currentPeriodNum = 1;
    currentJamNum += bout.jamCounts[1];
  }

  return (
    <div className="flex justify-evenly items-center text-9xl text-center align-middle">
      <div className="bg-red w-full text-7xl text-center">
        {jam.period == 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 w-full">
        <h1 className="text-center">P{currentPeriodNum + 1}</h1>
        <h1 className="text-center">J{currentJamNum + 1}</h1>
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
