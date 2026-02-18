import BoutPicker from "@/components/bout-picker";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import queryClient from "@/lib/cache";
import { redo, undo } from "@/lib/history";
import { AppShell, Burger, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useState } from "react";
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
  const [opened, { toggle }] = useDisclosure();

  const { data: bouts } = useSuspenseGetAllBouts();
  const [boutUuid, setBoutUuid] = useState(bouts[bouts.length - 1].uuid);

  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{
              width: 200,
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
          >
            <AppShell.Header>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
            </AppShell.Header>

            <AppShell.Navbar m="md">
              <BoutPicker onChange={(uuid: string) => setBoutUuid(uuid)} />
              {/* TODO: Navbar */}
            </AppShell.Navbar>

            <AppShell.Main>
              <Suspense fallback={"Loading..."}>
                <Operator boutUuid={boutUuid} />
              </Suspense>
            </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
