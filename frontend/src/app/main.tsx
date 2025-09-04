import Button from "@/components/button";
import Clock from "@/components/clock";
import JamNumView from "@/components/jam-num-view";
import TeamView from "@/components/team-view";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import useSeries from "@/hooks/use-series";
import useServerOffset from "@/hooks/use-server-offset";
import { Bout, Team } from "@/lib/bout";
import queryClient from "@/lib/cache";
import { Series } from "@/lib/series";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect } from "react";
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
  const series: Series = useSeries(0);
  if (series.bouts.length == 0) {
    // TODO: Go to Bout creation page
    throw new Error("This Series does not have any Bouts");
  }
  const bout: Bout = useBout(series.bouts[0].id);
  const context = useBoutContext(series.bouts[0].id);

  useEffect(() => {
    console.log(`Bout state: ${bout.getState()}`);
  }, [bout]);

  return (
    <>
      <div className="place-content-around grid grid-flow-col">
        {bout.teams.map((team: Team, index: number) => (
          <TeamView key={index} team={team} context={context} />
        ))}
      </div>
      <BoutTimeInformation />
      <div className="place-content-around grid grid-flow-col">
        <Button onClick={() => void bout.setupTrack()}>Start Period</Button>
        <Button onClick={() => void bout.startJam()}>Start Jam</Button>
        <Button onClick={() => void bout.stopJam()}>Stop Jam</Button>
        <Button onClick={() => void bout.callTimeout()}>Call Timeout</Button>
        <Button onClick={() => void bout.endTimeout()}>End Timeout</Button>
        <Button onClick={() => void bout.clearTrack()}>End Period</Button>
      </div>
    </>
  );
}

function BoutTimeInformation() {
  const bout = useBout(1);
  const context = useBoutContext(1);

  // Render a placeholder message when the Bout is not running
  if (bout.activeJam === null) {
    let content: string;
    const numPeriods = bout.jamCounts.length;
    if (numPeriods === 0) {
      content = "Starting Soon";
    } else if (numPeriods === 1) {
      content = "Halftime";
    } else if (!bout.isFinal) {
      content = "Unofficial Score";
    } else {
      content = "Final Score";
    }
    return <div className="m-2 text-center">{content}</div>;
  }

  // Determine the parameters for the action Clock
  let startTimestamp: Date | null;
  let stopTimestamp: Date | null | undefined;
  let alarm: number | undefined;
  if (!bout.activeJam.hasStarted() || bout.activeJam.isRunning()) {
    startTimestamp = bout.activeJam.startTimestamp;
    stopTimestamp = bout.activeJam.stopTimestamp;
    alarm = context.jamDuration;
  } else if (bout.activeTimeout?.isRunning()) {
    startTimestamp = bout.activeTimeout.startTimestamp;
  } else {
    startTimestamp = bout.activeJam.stopTimestamp;
  }

  return (
    <div className="gap-3 grid grid-flow-col">
      {/* Show the Bout clock, except during overtime */}
      {bout.jamCounts.length > 2 ? "OT" : <Clock {...bout.clock} />}

      <JamNumView {...bout.activeJam} jamCounts={bout.jamCounts} />

      <Clock
        startTimestamp={startTimestamp}
        stopTimestamp={stopTimestamp}
        alarm={alarm}
      />
    </div>
  );
}
