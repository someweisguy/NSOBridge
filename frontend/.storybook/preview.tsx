import "@/app/global.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";
import { http, HttpResponse, ws } from "msw";
import { initialize, mswLoader } from "msw-storybook-addon";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import queryClient from "../lib/cache";

const SERVER_URL = new URL("http://127.0.0.1:8000");

// mock-service-worker
initialize({
  onUnhandledRequest: "bypass",
});

// Intercept WebSocket connections to the Storybook URL
const originalLink = ws.link("ws://127.0.0.1:6006/ws/");

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
          url.port = SERVER_URL.port.toString();
          return new HttpResponse(null, {
            status: StatusCodes.TEMPORARY_REDIRECT,
            headers: {
              location: url.href,
            },
          });
        }),
        originalLink.addEventListener("connection", ({ client, server }) => {
          server.connect();

          // Open a WebSocket connection to the backend and begin message forwarding
          const targetSocket = new WebSocket(`ws://${SERVER_URL.host}/ws/`);
          targetSocket.addEventListener("message", (event) => {
            client.send(event.data as string);
          });
          client.addEventListener("message", (event) => {
            event.preventDefault(); // Don't forward WS to Storybook
            if (targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(event.data as string);
            } else {
              targetSocket.addEventListener(
                "open",
                () => targetSocket.send(event.data as string),
                { once: true },
              );
            }
          });

          // Synchronize Websocket close state
          targetSocket.addEventListener("close", (event) => {
            client.close(event.code, event.reason);
          });
          client.addEventListener("close", () => {
            targetSocket.close();
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
