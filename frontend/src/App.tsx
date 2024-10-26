import { useOnlineState, useLatency, useGetter } from "./client";
import { Suspense } from "react";
import "./App.css";

function App() {
  const latency: number = useLatency();
  const isConnected: boolean = useOnlineState();

  return (
    <>
      Connected: {isConnected.toString()}
      <br />
      Latency: {latency}ms
      <br />
      <Suspense fallback={<h1>Loading...</h1>}>
        <Body />
      </Suspense>
    </>
  );
}

function Body() {
  const series: object = useGetter("series");
  const boutIds: Array<string> = Object.keys(series);

  if (boutIds.length > 1) {
    // TODO: display bout selection screen
  } else if (boutIds.length == 1) {
    // Automatically select the only bout
  } else {
    // TODO: go to the bout creation page
  }

  return <body>{JSON.stringify(series)}</body>;
}

export default App;
