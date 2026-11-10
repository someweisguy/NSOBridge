import "@/app/global.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";
import { http, HttpResponse } from "msw";
import { initialize, mswLoader } from "msw-storybook-addon";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import queryClient from "../lib/cache";

const SERVER_PORT = 8000;

// mock-service-worker
initialize({
  onUnhandledRequest: "bypass",
});

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
          // Automatically redirect to the running server
          const url = new URL(request.url);
          url.port = SERVER_PORT.toString();
          return new HttpResponse(null, {
            status: StatusCodes.TEMPORARY_REDIRECT,
            headers: {
              location: url.href,
            },
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
