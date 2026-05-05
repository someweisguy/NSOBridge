import queryClient from "@/lib/cache";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, StrictMode, Suspense } from "react";

export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          {/* TODO: Add Error Boundary */}
          <Suspense>{children}</Suspense>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
