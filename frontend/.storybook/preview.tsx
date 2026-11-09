import "@/app/global.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, passthrough } from "msw";
import { initialize, mswLoader } from "msw-storybook-addon";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import queryClient from "../lib/cache";

initialize(); // mock-service-worker

const BACKEND_URL = "http://127.0.0.1:8000";

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
        http.all(`${BACKEND_URL}/*`, () => {
          // Ignore all requests sent to the actual server
          return passthrough();
        }),
        http.all("/api/*", async ({ request }) => {
          const url = new URL(request.url);

          // Forward the request to the desired port
          const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
          return fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            // duplex: "half",  // FIXME
          });
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
