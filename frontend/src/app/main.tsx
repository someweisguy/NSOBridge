// import Clock from "@/components/clock";
import TimeoutBar from "@/components/timeout-bar";
import useBout from "@/hooks/use-bout";
import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

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
  console.log(bout);

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

  return <TimeoutBar {...bout.teams[0]} />;

  // if (bout.activeJam !== null) {
  //   return (
  //     <>
  //       <Clock {...bout.clock} />{" "}
  //       <Clock {...bout.activeJam} alarm={1000 * 60 * 2} />
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     <Clock {...bout.clock} />
  //   </>
  // );
}
