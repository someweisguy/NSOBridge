import "./JamComponent.css"
import React from "react";
import PropTypes from 'prop-types';
import { onEvent, sendRequest } from "../client.js";

const HOME = "home";
const AWAY = "away";
const OFFICIAL = "official";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

const NULL_JAM_SCORE = {
  uuid: null,
  trips: [],
  lead: false,
  lost: false,
  starPass: null,
  isLeadEligible: true
};

const NULL_STOPPAGE = {
  uuid: null,
  current: null,
  home: {
    officialReviewRemaining: 1,
    timeoutsRemaining: 3
  },
  away: {
    officialReviewRemaining: 1,
    timeoutsRemaining: 3
  }
}

export function ScoreboardEditor({ boutUuid }) {
  const [uri, setUri] = React.useState(null);
  const [bout, setBout] = React.useState(null);
  const [period, setPeriod] = React.useState(null);
  const [jam, setJam] = React.useState(null);
  const [timeout, setTimeout] = React.useState(NULL_STOPPAGE);

  const [readyForIntermission, setReadyForIntermission] = React.useState(false);

  // Get information about the current Timeout, Period, and Jam
  React.useEffect(() => {
    let ignore = false;
    sendRequest("bout", { uri: { bout: boutUuid } })
      .then((newBout) => {
        if (!ignore) {
          const newUri = {
            bout: boutUuid, period: newBout.periodCount - 1,
            jam: newBout.currentJamNum
          };
          sendRequest("period", { uri: newUri }).then((newPeriod) => setPeriod(newPeriod));
          sendRequest("jam", { uri: newUri }).then((newJam) => setJam(newJam));
          // TODO: add current timeout to bout API
          setBout(newBout);
          setUri(newUri);
        }
      });
    sendRequest("boutTimeout", { uri: { bout: boutUuid } })
      .then((newTimeout) => {
        if (!ignore) {
          setTimeout(newTimeout);
        }
      });
    return () => ignore = true;
  }, [boutUuid]);

  // Subscribe to changes of the current Timeout, Period, and Jam
  React.useEffect(() => {
    const unsubscribeStoppage = onEvent("boutTimeout", (newStoppage) => {
      setTimeout(newStoppage);
    });
    return unsubscribeStoppage;
  }, []);
  React.useEffect(() => {
    if (bout === null) {
      return;
    }
    const unsubscribeBout = onEvent("bout", (newBout) => {
      if (newBout.uuid === bout.uuid) {
        setBout(newBout);
      }
    });
    return unsubscribeBout;
  }, [bout]);
  React.useEffect(() => {
    if (period === null) {
      return;
    }
    const unsubscribePeriod = onEvent("period", (newPeriod) => {
      const ready = newPeriod.clock.elapsed >= newPeriod.clock.alarm;
      setReadyForIntermission(ready);
      if (newPeriod.uuid === period.uuid) {
        setPeriod(newPeriod);
      }
    });
    return unsubscribePeriod;
  }, [period]);
  React.useEffect(() => {
    if (jam === null) {
      return;
    }
    const unsubscribeJam = onEvent("jam", (newJam) => {
      if (newJam.uuid === jam.uuid) {
        setJam(newJam);
      }
    });
    return unsubscribeJam;
  }, [jam])

  const goToNextJam = React.useCallback(() => {
    const newUri = { ...uri };
    newUri.jam++;
    if (newUri.jam === bout?.jamCounts[newUri.period]) {
      newUri.period++;
      newUri.jam = 0;
    }
    sendRequest("jam", { uri: newUri })
      .then((newJam) => {
        setJam(newJam);
        setUri(newUri);
      })
  }, [uri, bout]);

  const goToPreviousJam = React.useCallback(() => {
    const newUri = { ...uri };
    newUri.jam--;
    if (newUri.jam < 0) {
      newUri.period--;
      newUri.jam = bout?.jamCounts[newUri.period] - 1;
    }
    sendRequest("jam", { uri: newUri })
      .then((newJam) => {
        setJam(newJam);
        setUri(newUri);
      })
  }, [uri, bout]);

  const goToNextPeriod = React.useCallback(() => {
    const newUri = { ...uri };
    newUri.period++;
    newUri.jam = 0;
    sendRequest("period", { uri: newUri })
      .then((newPeriod) => {
        sendRequest("jam", { uri: newUri })
          .then((newJam) => {
            setPeriod(newPeriod);
            setJam(newJam);
            setUri(newUri);
          });
      })
  }, [uri])

  // Determine button visibility
  const previousJamVisible = uri?.jam > 0 || uri?.period > 0 ? "visible" : "hidden";
  const nextJamVisible = uri?.jam + 1 < bout?.jamCounts[uri?.period]
    || uri?.period + 1 < bout?.periodCount ? "visible" : "hidden";

  const jamIsRunning = jam?.hasStarted && jam?.clock.running;
  const readyForNextPeriod = period?.clock.elapsed >= period?.clock.alarm;

  const timeoutIsRunning = timeout?.current !== null;

  return (
    <>
      <div>
        {previousJamVisible &&
          <button onClick={goToPreviousJam} style={{ visibility: previousJamVisible }}>
            Last Jam
          </button>}

        &nbsp;
        {uri && ("P" + (uri.period + 1) + " J" + (uri.jam + 1))}
        &nbsp;

        {nextJamVisible &&
          <button onClick={goToNextJam} style={{ visibility: nextJamVisible }}>
            Next Jam
          </button>}
      </div>

      {!jamIsRunning && readyForNextPeriod &&
        <button onClick={goToNextPeriod} style={{ visibility: readyForIntermission }}>
          End Period
        </button>}

      <br />

      {timeoutIsRunning ? (
        <TimeoutController timeout={timeout.current} />
      ) : (
        <JamController uri={uri} hasStarted={jam?.hasStarted}
          jamClock={jam?.clock} stopReason={jam?.stopReason} />
      )}

      <div>
        <JamScore uri={uri} team={HOME} />
        <JamScore uri={uri} team={AWAY} />
      </div>
    </>
  );
}
ScoreboardEditor.propTypes = {
  boutUuid: PropTypes.string.isRequired
}


function JamScore({ uri, team }) {
  const [state, setState] = React.useState(NULL_JAM_SCORE);
  const [selectedTrip, setSelectedTrip] = React.useState(0);
  const latestTripIsSelected = React.useRef(true);
  const scrollBar = React.useRef(null);

  // Request new data when the Jam changes
  React.useEffect(() => {
    if (uri === null) {
      return;
    }
    let ignore = false;
    sendRequest("jamScore", { uri, team })
      .then((newState) => {
        if (!ignore) {
          setSelectedTrip(newState.trips.length);
          setState(newState)
        }
      });
    return () => ignore = true;
  }, [uri, team]);

  React.useEffect(() => {
    if (uri === null) {
      return;
    }
    const unsubscribeFunction = onEvent("jamScore", (newState) => {
      if (newState.uuid === state.uuid && newState.team === team) {
        setState(newState);
      }
    });
    return () => unsubscribeFunction();
  }, [state, team])

  // Ensure the new latest Trip is selected when adding a new Trip
  React.useEffect(() => {
    if (latestTripIsSelected.current) {
      setSelectedTrip(state.trips.length);
    }
  }, [state.trips]);
  React.useEffect(() => {
    latestTripIsSelected.current = selectedTrip === state.trips.length;
  }, [selectedTrip, state.trips]);

  // Scroll to the selected Trip
  React.useEffect(() => {
    const buttonWidth = scrollBar.current.children[0].offsetWidth;
    const scrollBarWidth = scrollBar.current.offsetWidth;
    const scrollOffset = (scrollBarWidth / 2) + (buttonWidth / 2);
    scrollBar.current.scrollLeft = (buttonWidth * selectedTrip) - scrollOffset;
  }, [selectedTrip])

  const setTrip = React.useCallback((tripNum, points, validPass = true) => {
    sendRequest("setTrip", { uri, team, tripNum, points, validPass });
  }, [uri, team]);

  const deleteTrip = React.useCallback((tripNum) => {
    sendRequest("deleteTrip", { uri, team, tripNum });
  }, [uri, team])

  const setLead = React.useCallback((lead) => {
    sendRequest("setLead", { uri, team, lead });
  }, [uri, team]);

  const setLost = React.useCallback((lost) => {
    sendRequest("setLost", { uri, team, lost });
  }, [uri, team]);

  const setStarPass = React.useCallback((tripNum) => {
    sendRequest("setStarPass", { uri, team, tripNum });
  }, [uri, team]);

  // Render the Trip point buttons
  let pointButtons = [];
  if (selectedTrip === 0) {
    const className = "initial";
    pointButtons = (
      <>
        <button key={-1} className={className} onClick={() => setTrip(0, 0, false)}>
          NP/NP
        </button>
        <button key={-2} className={className} onClick={() => setTrip(0, 0)}>
          Initial
        </button>
      </>
    );
  } else {
    // When editing a Trip disable the score button of the current Trip points
    const disableIndex = selectedTrip < state.trips.length
      ? state.trips[selectedTrip].points
      : null;

    // Instantiate the Trip point buttons
    for (let i = 0; i <= 4; i++) {
      const disabled = i === disableIndex;
      pointButtons.push(
        <button key={i} className="points" onClick={() => setTrip(selectedTrip, i)}
          disabled={disabled} >
          {i}
        </button>
      );
    }
  }

  // Render the Trip edit/delete component
  // TODO: Change dialog when editing initial Trip
  const tripEditDialog = (
    <>
      Editing trip {selectedTrip + 1}.&nbsp;
      <button onClick={() => deleteTrip(selectedTrip)}>Delete</button>
    </>
  );
  const tripEditDialogVisibility = selectedTrip < state.trips.length
    ? "visible" : "hidden";

  // Render the Trip buttons
  const tripButtons = []
  const currentTrip = { points: "\u00A0" };
  [...state.trips, currentTrip].forEach((trip, i) => {
    tripButtons.push(
      <button key={trip.uuid} onClick={() => setSelectedTrip(i)}>
        <small>Trip {i + 1}</small><br />
        {trip.points}
      </button>
    );
  });
  tripButtons[selectedTrip].props.className = "activeTrip";

  return (
    <div className="tripComponent">

      <div className="tripInput">
        {pointButtons}
      </div>

      <div className="tripEdit" style={{ visibility: tripEditDialogVisibility }}>
        {tripEditDialog}
      </div>

      <div className="scrollBar">
        <button onClick={() => {
          const buttonWidth = scrollBar.current.children[0].offsetWidth;
          scrollBar.current.scrollLeft -= buttonWidth;
        }}>
          &lt;
        </button>
        <div ref={scrollBar} className="trips">
          {tripButtons}
        </div>
        <button onClick={() => {
          const buttonWidth = scrollBar.current.children[0].offsetWidth;
          scrollBar.current.scrollLeft += buttonWidth;
        }}>
          &gt;
        </button>
      </div>

      <div>
        <div>
          Lead&nbsp;
          <input type="checkbox" checked={state.lead} onClick={() => setLead(!state.lead)}
            disabled={!state.isLeadEligible || state.lost} />
        </div>
        <div>
          Lost&nbsp;
          <input type="checkbox" checked={state.lost} onClick={() => setLost(!state.lost)} />
        </div>
        <div>
          Star Pass&nbsp;
          <input type="checkbox" checked={state.starPass !== null}
            onClick={() => setStarPass(state.starPass === null ? selectedTrip : null)} />
        </div>
      </div>

    </div>
  );
}
JamScore.propTypes = {
  uri: PropTypes.object.isRequired,
  team: PropTypes.string.isRequired
}

function JamController({ uri, hasStarted, jamClock, stopReason }) {
  const isFinished = hasStarted && !jamClock?.running;

  const startJam = React.useCallback(() => {
    sendRequest("startJam", { uri });
  }, [uri]);

  const stopJam = React.useCallback(() => {
    sendRequest("stopJam", { uri });
  }, [uri]);

  const setJamStopReason = React.useCallback((stopReason) => {
    sendRequest("setJamStopReason", { uri, stopReason });
  }, [uri]);

  const callTimeout = React.useCallback(() => {
    sendRequest("callTimeout", {});
  }, [])

  let label = null;
  const buttons = [];
  if (!hasStarted) {
    buttons.push(
      <button onClick={startJam}>Start Jam</button>
    );
    buttons.push(
      <button onClick={callTimeout}>Timeout/OR</button>
    )
  } else if (!isFinished) {
    buttons.push(
      <button onClick={stopJam}>Stop Jam</button>
    );
  } else {
    label = (<small>Set stop reason: </small>);
    buttons.push(
      <button onClick={() => setJamStopReason(CALLED)}
        disabled={stopReason === CALLED}>Called</button>
    );
    buttons.push(
      <button onClick={() => setJamStopReason(TIME)}
        disabled={stopReason === TIME}>Time</button>
    );
    buttons.push(
      <button onClick={() => setJamStopReason(INJURY)}
        disabled={stopReason === INJURY}>Injury</button>
    );
  }

  return (
    <div>
      <div>
        {label}{buttons}
      </div>
      <div>

      </div>
    </div>
  );
}
JamController.propTypes = {
  uri: PropTypes.object.isRequired,
  hasStarted: PropTypes.bool.isRequired,
  jamClock: PropTypes.object.isRequired,
  stopReason: PropTypes.string
}

function TimeoutController({ timeout }) {
  const setTimeout = React.useCallback(() => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.isOfficialReview = false;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const setOfficialReview = React.useCallback(() => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.isOfficialReview = true;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const setCaller = React.useCallback((caller) => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.caller = caller;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const endTimeout = React.useCallback(() => {
    sendRequest("endTimeout");
  }, []);


  return (
    <div>
      <span>
        <button onClick={setTimeout} disabled={!timeout.isOfficialReview}>
          Timeout
        </button>
        <button onClick={setOfficialReview}
          disabled={timeout.isOfficialReview || timeout.caller === OFFICIAL}>
          Official Review
        </button>
      </span>

      <span>
        <button onClick={() => setCaller(HOME)} disabled={timeout.caller === HOME}>
          Home
        </button>
        <button onClick={() => setCaller(OFFICIAL)}
          disabled={timeout.caller === OFFICIAL || timeout.isOfficialReview}>
          Official
        </button>
        <button onClick={() => setCaller(AWAY)} disabled={timeout.caller === AWAY}>
          Away
        </button>
      </span>

      <span>
        <button onClick={endTimeout}>End {timeout.isOfficialReview ? "O/R" : "T/O"}</button>
      </span>

    </div>
  );
}
TimeoutController.propTypes = {
  timeout: PropTypes.object.isRequired
}

function IntermissionController({ }) {

  return (
    <></>
  );
}