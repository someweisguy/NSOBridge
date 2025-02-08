import { queryClient } from "@/lib/client.ts";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./app.tsx";
import "./index.css";
import LoadingSpinner from "@/components/loading-spinner.tsx";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <Suspense fallback={<LoadingSpinner />}>
        <App />
      </Suspense>
    </StrictMode>
  </QueryClientProvider>
);

// Get the Series data from the HTML root
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
