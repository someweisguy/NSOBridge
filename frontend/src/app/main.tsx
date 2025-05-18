import queryClient from "@/lib/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ScoreboardOperator } from "./pages/operator";
import { BoutIdProvider } from "./provider";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <Suspense fallback={"Loading..."}>
        <QueryClientProvider client={queryClient}>
          <BoutIdProvider>
              <ScoreboardOperator />
          </BoutIdProvider>
        </QueryClientProvider>
      </Suspense>
    </StrictMode>
  );
}
