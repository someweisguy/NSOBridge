import Clock from "@/components/clock";
import withTeam from "@/components/team-component";
import useBout from "@/hooks/use-bout";
import useRuleset from "@/hooks/use-ruleset";
import useJam from "@/hooks/use-jam";
import queryClient from "@/lib/cache";
import { Bout, Ruleset } from "@/types/game";
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

const TeamComponent = withTeam();

function Test() {
  const bout = useBout(1);
  const context = useRuleset(1);

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
      {copy}{" "}
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </div>
  );
}

function BoutTimeInformation({
  bout,
  context,
}: {
  bout: Bout;
  context: Ruleset;
}) {
  let periodNum = 0;
  let jamNum = 0;
  for (const i of bout.jamCounts) {
    if (i > 0) {
      jamNum = i - 1;
      break;
    }
    periodNum++;
  }

  const activeJam = useJam(bout, periodNum, jamNum);

  if (!bout.isRunning) {
    return <IntermissionStatus bout={bout} />;
  }

  let displayPeriod = activeJam.period;
  let displayJam = activeJam.num;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += bout.jamCounts[1];
  }

  return (
    <div className="flex justify-evenly items-center text-9xl text-center align-middle">
      <div className="bg-red w-full text-7xl text-center">
        {activeJam.period == 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 w-full">
        <h1 className="text-center">P{displayPeriod + 1}</h1>
        <h1 className="text-center">J{displayJam + 1}</h1>
      </div>
      <div className="w-full text-7xl text-center">
        {!activeJam.hasStarted() || activeJam.isRunning() ? (
          <Clock {...activeJam} alarm={context.jamDuration} />
        ) : (
          <Clock
            startTimestamp={activeJam.stopTimestamp}
            alarm={context.lineupDuration}
          />
        )}
      </div>
    </div>
  );
}

function BoutTertiaryInformation({ bout }: { bout: Bout }) {
  if (["timeout", "lineup"].includes(bout.state)) {
    let content = "";
    if (bout.state == "timeout") {
      // TODO: Implement Team Timeout and Official Review
      content = "Timeout";
    } else if (bout.state == "lineup") {
      content = "Lineup";
    }

    return <h1 className="text-7xl">{content}</h1>;
  }

  // TODO: Implement Jam state
  return <></>;
}
