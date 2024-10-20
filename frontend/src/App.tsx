import { useOnlineState, useLatency, useRequest } from "./client";
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
  const { data } = useRequest('series');
  
  

  return <body>{JSON.stringify(data)}</body>;
}

export default App;
