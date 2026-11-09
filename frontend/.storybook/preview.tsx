import "@/app/global.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { bypass, http } from "msw";
import { initialize, mswLoader } from "msw-storybook-addon";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import queryClient from "../lib/cache";

initialize(); // mock-service-worker

const preview: Preview = {
  loaders: [mswLoader],
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.all("api/*", ({ request }) => {
          const proxyUrl = new URL(request.url);

          // Forward the request to the desired port
          proxyUrl.port = "8000";

          const proxyRequest = new Request(proxyUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            // duplex: "half",  // FIXME
          });

          // Send the request to the new port using bypass() to prevent handler loops
          return fetch(bypass(proxyRequest));
        }),
      ],
    },
    viewport: {
      options: {
        smallDesktop: {
          name: "Small Desktop",
          styles: { width: "1280px", height: "585px" },
        },
        ...MINIMAL_VIEWPORTS,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Timestamp$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    deepControls: { enabled: true },
  },
};

export default preview;
