import BoutPicker from "@/components/bout-picker";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import queryClient from "@/lib/cache";
import { AppShell, Burger, MantineProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, StrictMode, Suspense, useState } from "react";
import BoutProvider from "./bout-provider";

export function AppProvider({ children }: PropsWithChildren) {
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
                <BoutProvider boutUuid={boutUuid}>{children}</BoutProvider>
              </Suspense>
            </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
