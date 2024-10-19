import { Suspense } from "react";
import { useConnectionStatus, useLatency, useRequest, client } from "./client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./App.css";



function App() {
  const latency = useLatency();
  const isConnected: boolean = useConnectionStatus();

  return (
    <QueryClientProvider client={client}>
      Connected: {isConnected.toString()}
      <br />
      Latency: {latency.data}ms
      <br />
      <Suspense fallback={<h1>Loading...</h1>}>
        <Body />
      </Suspense>
    </QueryClientProvider>
  );
}

function Body() {
  const { data } = useRequest('series');

  return <body>{JSON.stringify(data)}</body>;
}

export default App;
