import Clock from "@/components/clock";
import JamNumView from "@/components/jam-num-view";
import TimeoutBar from "@/components/timeout-bar";
import useBout from "@/hooks/use-bout";
import useBoutContext from "@/hooks/use-bout-context";
import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import TeamsView from "@/components/teams-view";

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

  if (bout.activeJam !== null) {
    return (
      <>
        <JamNumView {...bout.activeJam} />
        <TeamsView teams={bout.teams} context={context} PeerElement={<>Hello!</>} />
        <Clock {...bout.clock} />{" "}
        <Clock {...bout.activeJam} alarm={context.jamDuration} />
      </>
    );
  }

  return (
    <>
      <TimeoutBar {...bout.teams[0]} {...context} />;
      <Clock {...bout.clock} />
    </>
  );
}
