import BoutPicker from "@/components/bout-picker";
import { useGetAllBouts } from "@/hooks/use-get-all-bouts";
import queryClient from "@/lib/cache";
import { AppShell, Burger, MantineProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  PropsWithChildren,
  StrictMode,
  Suspense,
  useEffect,
  useState,
} from "react";
import BoutProvider from "./bout-provider";

const urlParams = new URLSearchParams(window.location.search);
const boutUuidParamName = "boutUuid";

interface AppProviderProps extends PropsWithChildren {
  useShell?: boolean;
}

export default function AppProvider({
  useShell = false,
  children,
}: AppProviderProps) {
  const [opened, { toggle }] = useDisclosure();

  const {
    data: bouts,
    isPending,
    isEnabled,
  } = useGetAllBouts({
    enabled: !urlParams.has(boutUuidParamName) || useShell,
  });
  const [boutUuid, setBoutUuid] = useState<string | null>(
    urlParams.get(boutUuidParamName),
  );

  useEffect(() => {
    if (
      isEnabled &&
      !isPending &&
      bouts != null &&
      !urlParams.has(boutUuidParamName)
    ) {
      setBoutUuid(bouts[0].uuid);
    }
  }, [bouts, isPending, isEnabled]);

  if (boutUuid == null) {
    return <></>;
  }

  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <BoutProvider boutUuid={boutUuid}>
            {useShell ? (
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
                  <BoutPicker
                    onChange={(uuid: string | null) => setBoutUuid(uuid)}
                  />
                  {/* TODO: Navbar */}
                </AppShell.Navbar>

                <AppShell.Main>
                  <Suspense fallback={"Loading..."}>{children}</Suspense>
                </AppShell.Main>
              </AppShell>
            ) : (
              children
            )}
          </BoutProvider>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
