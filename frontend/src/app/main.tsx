import Clock from "@/components/clock";
import JamNumView from "@/components/jam-num-view";
import TeamView from "@/components/team-view";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import { Team } from "@/lib/bout";
import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import useServerOffset from "@/hooks/use-server-offset";
import Button from "@/components/button";

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
  const bout = useBout(1);
  const context = useBoutContext(1);

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
