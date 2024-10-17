import { Suspense } from "react";
import "./App.css";
import { useConnectionStatus, useLatency, sendRequest } from "./client";
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const latency: number = useLatency();
  const isConnected: boolean = useConnectionStatus();

  return (
    <QueryClientProvider client={queryClient}>
      Connected: {isConnected.toString()}
      <br />
      Latency: {latency}ms
      <br />
      <Suspense fallback={<h1>Loading...</h1>}>
        <Body />
      </Suspense>
    </QueryClientProvider>
  );
}

function Body() {
  const { data } = useSuspenseQuery({
    queryKey: ["series"],
    queryFn: () => sendRequest("series", "get"),
  });

  return <body>{JSON.stringify(data)}</body>;
}

export default App;
