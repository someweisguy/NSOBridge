import './App.css';
import { React, useState, useEffect } from "react";
import { ScoreboardEditor } from './components/JamComponent.jsx';
import { onEvent, sendRequest } from './client.js';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [boutUuid, setBoutUuid] = useState(null);

  // Add connect and disconnect listeners
  useEffect(() => {
    const unsubscribeConnect = onEvent("connect",
      () => setIsConnected(true)
    );
    const unsubscribeDisconnect = onEvent("disconnect",
      () => setIsConnected(false)
    );

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  // Request server data on connection
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Calculate connection latency then get server information
    let ignore = false;
    calculateLatency(10).then(() => {
      sendRequest("getBouts").then((series) => {
        if (ignore) {
          return;  // Ignore old requests
        }

        // If the client already has a Bout UUID, ensure it is valid
        if (boutUuid !== null) {
          let hasValidBout = false;
          for (let bout of series) {
            if (boutUuid === bout.uuid) {
              hasValidBout = true;
              break;
            }
          }

          // Refresh the Bout UUID so data may be reloaded
          if (hasValidBout) {
            let refreshedUuid = boutUuid;
            setBoutUuid(refreshedUuid);
            return;
          }
          setBoutUuid(null);  // Discard invalid Bout UUID
        }

        // Choose an action based on the Bouts available
        if (series.length === 0) {
          // TODO: Go to "Create new Bout"
        } else if (series.length === 1) {
          // Select the only created Bout
          const bout = series[0];
          setBoutUuid(bout.uuid);
        } else {
          // TODO: Go to "Select a Bout"
        }
      });
    });

    // Periodically recalculate the client-server latency
    const intervalId = setInterval(() => calculateLatency(5), 25000);

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, [isConnected]);

  // Show a loading icon if a Bout has not been selected
  if (boutUuid === null) {
    // TODO
    return (
      <></>
    );
  }

  return (
    <div className="App">
      <ScoreboardEditor boutUuid={boutUuid} />
    </div>
  );
}

export default App;
