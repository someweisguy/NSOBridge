import { queryClient } from "./client.ts";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<h1>Loading...</h1>}>
      <StrictMode>
        <App />
      </StrictMode>
    </Suspense>
  </QueryClientProvider>
);

// Get the Bout data from the HTML root
const rootNode: HTMLElement | null = document.getElementById("root");
if (rootNode?.dataset?.model) {
  try {
    queryClient.setQueryData(
      ["series"], // TODO: use key factory
      JSON.parse(rootNode.dataset.model)
    );
  } catch {
    console.error("Could not parse data model seed.");
  }
} else {
  console.error("Data model not found in server response.");
}
