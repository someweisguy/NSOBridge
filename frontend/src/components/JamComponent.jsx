import "./JamComponent.css"
import { React, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { sendRequest, useBout, useJam } from "../client.js";
import { HalftimeClock } from "./TimerComponent.jsx"

const HOME = "home";
const AWAY = "away";
const OFFICIAL = "official";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";

function useNextUri(bout, uri) {
  const [nextUri, setNextUri] = useState(null);

  useEffect(() => {
    if (bout == null || uri == null) {
      setNextUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam++;

    // Ensure the next Jam exists
    const jamCounts = bout.jamCounts;
    if (newUri.jam >= jamCounts[newUri.period]) {
      if (newUri.period == 1) {
        return null;  // Can't have more than 2 Periods
      }
      newUri.period++;
      if (jamCounts[newUri.period] == 0) {
        return null;  // There are no Jams in the next Period
      }
      newUri.jam = 0;
    }

    setNextUri(newUri);
  }, [bout, uri]);


  return nextUri;
}


function usePreviousUri(bout, uri) {
  const [previousUri, setPreviousUri] = useState(null);

  useEffect(() => {
    if (bout == null || uri == null) {
      setPreviousUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam--;

    // Ensure the previous Jam exists
    const jamCounts = bout.jamCounts;
    if (newUri.jam < 0) {
      if (newUri.period == 0) {
        return null;  // Already on the zeroeth Period
      }
      newUri.period--;
      newUri.jam = jamCounts[newUri.period];
    }

    setPreviousUri(newUri);
  }, [bout, uri]);


  return previousUri;
}



export function ScoreboardEditor({ boutUuid }) {

  const bout = useBout(boutUuid);

  const [uri, setUri] = useState(null);
  const jam = useJam(boutUuid, uri?.period, uri?.jam)

  const nextUri = useNextUri(bout, uri);
  const previousUri = usePreviousUri(bout, uri);

  // Ensure the Jam URI is valid
  if (bout != null) {
    const jamDoesNotExist = uri?.jam >= bout.jamCounts[bout.currentPeriodNum];
    if (jamDoesNotExist) {
      // TODO: Notify the user that the Jam does not exist
    }
    if (uri == null || jamDoesNotExist) {
      const period = bout.currentPeriodNum;
      const jam = bout.jamCounts[period] - 1;
      setUri({ period, jam })
    }
  }





  // const jamIsRunning = jam?.hasStarted && jam?.clock.running;
  // const readyForNextPeriod = period?.clock.elapsed >= period?.clock.alarm;

  // const timeoutIsRunning = timeout?.current !== null;

  // const halftimeIsRunning = period !== null ? !period.hasStarted : false;

  // if (halftimeIsRunning) {
  //   return (
  //     <IntermissionController uri={uri} period={period}/>
  //   )
  // }

  const fullUri = { ...uri, bout: boutUuid };

  return (
    <div>


      <div>
        {uri != null &&
          <p>
            {previousUri != null && "<"}
            P{uri.period + 1} J{uri.jam + 1}
            {nextUri != null && ">"}
          </p>
        }
      </div>

      <div>
        {jam != null &&
          <>
            <JamScore uri={fullUri} state={jam.score.home} team={HOME} />
            <JamScore uri={fullUri} state={jam.score.away} team={AWAY} />
          </>
        }
      </div>

    </div>
  );
}
ScoreboardEditor.propTypes = {
  boutUuid: PropTypes.string.isRequired
}


function JamScore({ uri, state, team }) {
  const [selectedTrip, setSelectedTrip] = React.useState(0);
  const latestTripIsSelected = React.useRef(true);
  const scrollBar = React.useRef(null);




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
  state: PropTypes.object.isRequired,
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

function IntermissionController({ uri }) {


  return (
    <>
      <HalftimeClock boutUuid={uri.bout} />
    </>
  );
}
IntermissionController.propTypes = {
  uri: PropTypes.object.isRequired
}