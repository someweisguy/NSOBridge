import { useOnlineState, useLatency } from "./client";
import { useSeries } from "./api/series";
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
  const series: Map<string, object> = useSeries();

  if (series.size > 1) {
    // TODO: display bout selection screen
  } else if (series.size == 1) {
    // Automatically select the only bout
    const boutId: string = Array.from(series.keys())[0];
    const bout: object | undefined = series.get(boutId)
    return (
    <>
      {boutId}: {JSON.stringify(bout)}
    </>
    );
  } else {
    // TODO: go to the bout creation page
  }

  return <body>{JSON.stringify(series)}</body>;
}

export default App;
