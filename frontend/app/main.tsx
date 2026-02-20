import { AppProvider } from "@/components/app-provider";
import { redo, undo } from "@/lib/history";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./global.css";
import Operator from "./operator";

// Register Ctrl+Z and Ctrl+Y as undo and redo respectively
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    if (event.key === "z") {
      void undo();
    }
    if (event.key === "y") {
      void redo();
    }
  }
});

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export function App() {
  return (
    <AppProvider>
      <Operator />
    </AppProvider>
  );
}
