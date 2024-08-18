import './App.css';
import { React, useState, useEffect, Suspense, useTransition} from "react";
import { ScoreboardEditor } from './components/JamComponent.jsx';
import { useSeries } from './customHooks.jsx';


function App() {
  const series = useSeries();
  const [boutUuid, setBoutUuid] = useState(null);

  useEffect(() => {

      // TODO: verify UUID is in series 
      if (series.length == 1) {
        setBoutUuid(series[0].uuid)
      } else if (series.length > 1) {
        // TODO: show Bout selection page
      } else {
        // TODO: error - no Bouts available
      }

  }, [series]);

  return (
    <div className="App">
      <Suspense fallback={<h1>Loading...</h1>}>
        <p>{boutUuid}</p>
        <ScoreboardEditor boutUuid={boutUuid} />
      </Suspense>
    </div>
  );
}

export default App;
