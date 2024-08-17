import './App.css';
import { React, useState, useEffect, Suspense} from "react";
import { ScoreboardEditor } from './components/JamComponent.jsx';
import { useSeries, useBout } from './customHooks.jsx';


function App() {
  const series = useSeries();
  const [boutUuid, setBoutUuid] = useState(null);
  const bout = useBout(boutUuid);

  useEffect(() => {
    // TODO: verify UUID is in series

    if (series.length == 1) {
      setBoutUuid(series[0])
    } else if (series.length > 1) {
      // TODO: show Bout selection page
    } else {
      // TODO: error - no Bouts available
    }
  }, [series]);

  return (
    <div className="App">
      <Suspense>
        <p>{bout.uuid}</p>
        <ScoreboardEditor bout={bout} />
      </Suspense>
    </div>
  );
}

export default App;
