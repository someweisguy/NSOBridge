import "./JamComponent.css"
import { React, useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import { sendRequest, useBout, useJam } from "../client.js";
import { HalftimeClock } from "./TimerComponent.jsx"

const HOME = "home";
const AWAY = "away";
const OFFICIAL = "official";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";

function useUriNavigation(bout, uri) {
  const [previousUri, setPreviousUri] = useState(null);
  const [nextUri, setNextUri] = useState(null);

  useEffect(() => {
    if (bout == null || uri == null) {
      setPreviousUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam -= 1;

    // Ensure the previous Jam exists
    const jamCounts = bout.jamCounts;
    if (newUri.jam < 0) {
      if (newUri.period == 0) {
        setPreviousUri(null);
        return;  // Already on the zeroeth Period
      }
      newUri.period -= 1;
      newUri.jam = jamCounts[newUri.period];
    }

    setPreviousUri(newUri);
  }, [bout, uri]);


  useEffect(() => {
    if (bout == null || uri == null) {
      setNextUri(null);
      return;
    }

    const newUri = { ...uri };
    newUri.jam += 1;

    // Ensure the next Jam exists
    const jamCounts = bout.jamCounts;
    if (newUri.jam >= jamCounts[newUri.period]) {
      if (newUri.period > 0) {
        setNextUri(null);
        return;  // Can't have more than 2 Periods
      }
      newUri.period += 1;
      if (jamCounts[newUri.period] < 1) {
        setNextUri(null);
        return;  // There are no Jams in the next Period
      }
      newUri.jam = 0;
    }

    setNextUri(newUri);
  }, [bout, uri]);


  return [previousUri, nextUri];
}


export function ScoreboardEditor({ boutUuid }) {
  const [uri, setUri] = useState(null);
  const bout = useBout(boutUuid);
  const jam = useJam(boutUuid, uri?.period, uri?.jam)

  const [previousUri, nextUri] = useUriNavigation(bout, uri);

  // Ensure the Jam URI is valid
  if (bout != null) {
    const jamDoesNotExist = uri?.jam >= bout.jamCounts[bout.currentPeriodNum];
    if (jamDoesNotExist) {
      // TODO: Notify the user that the Jam does not exist
    }
    if (uri == null || jamDoesNotExist) {
      const periodNum = bout.currentPeriodNum;
      const jamNum = bout.jamCounts[periodNum] - 1;
      setUri({ bout: boutUuid, period: periodNum, jam: jamNum });
    }
  }

  return (
    <div>


      <div>
        {uri != null &&
          <p>
            {previousUri != null &&
              <button onClick={() => setUri(previousUri)}>&lt;</button>
            }
            P{uri.period + 1} J{uri.jam + 1}
            {nextUri != null &&
              <button onClick={() => setUri(nextUri)}>&gt;</button>
            }
          </p>
        }
      </div>

      <div>
        {uri && jam &&
          <JamController uri={uri} jam={jam} />
        }
      </div>

      <div>
        {uri && jam &&
          <>
            <JamScore uri={uri} state={jam.score.home} team={HOME} />
            <JamScore uri={uri} state={jam.score.away} team={AWAY} />
          </>
        }
      </div>

    </div>
  );
}
ScoreboardEditor.propTypes = {
  boutUuid: PropTypes.string.isRequired
}

function JamPointButtons({ uri, jamScore, team, selectedTrip }) {
  const setTrip = useCallback((points, validPass = true) => {
    const tripNum = selectedTrip;
    sendRequest("setTrip", { uri, team, tripNum, points, validPass });
  }, [uri, team, selectedTrip]);

  if (selectedTrip == 0) {
    const className = "initial";
    return (
      <>
        <button key={-1} className={className} onClick={() => setTrip(0, false)}>
          NP/NP
        </button>
        <button key={-2} className={className} onClick={() => setTrip(0)}>
          Initial
        </button>
      </>
    );
  } else {
    // Instantiate the Trip point buttons
    const pointButtons = [];
    const currentTripPoints = jamScore.trips[selectedTrip]?.points;
    for (let i = 0; i <= 4; i++) {
      const disabled = (i == currentTripPoints);
      pointButtons.push(
        <button key={i} className="points" onClick={() => setTrip(i)}
          disabled={disabled}>
          {i}
        </button>
      );
    }
    return pointButtons;
  }
}
JamPointButtons.propTypes = {
  uri: PropTypes.object.isRequired,
  jamScore: PropTypes.object.isRequired,
  team: PropTypes.string.isRequired,
  selectedTrip: PropTypes.number.isRequired
}

function JamTripEditor({ uri, jamScore, team, selectedTripState }) {
  const [selectedTrip, setSelectedTrip] = selectedTripState;
  const scrollBar = useRef(null);

  // Scroll to the selected Trip
  useEffect(() => {
    const buttonWidth = scrollBar.current.children[0].offsetWidth;
    const scrollBarWidth = scrollBar.current.offsetWidth;
    const scrollOffset = (scrollBarWidth / 2) + (buttonWidth / 2);
    scrollBar.current.scrollLeft = (buttonWidth * selectedTrip) - scrollOffset;
  }, [selectedTrip])

  const scroll = useCallback((direction) => {
    if (direction == "left") {
      scrollBar.current.scrollLeft -= scrollBar.current.children[0].offsetWidth
    } else if (direction == "right") {
      scrollBar.current.scrollLeft += scrollBar.current.children[0].offsetWidth
    } else {
      throw Error("unknown scroll direction")
    }
  }, [])

  const deleteTrip = useCallback((tripNum) => {
    sendRequest("deleteTrip", { uri, team, tripNum });
  }, [uri, team])

  // Render the Trip edit/delete component
  // TODO: Change dialog when editing initial Trip
  const tripEditDialog = (
    <>
      Editing trip {selectedTrip + 1}.&nbsp;
      <button onClick={() => deleteTrip(selectedTrip)}>Delete</button>
    </>
  );
  const tripEditDialogVisibility = selectedTrip < jamScore.trips.length
    ? "visible" : "hidden";


  // Render the Trip buttons
  const tripButtons = []
  const currentTrip = { uuid: null, points: "\u00A0" };
  [...jamScore.trips, currentTrip].forEach((trip, i) => {
    tripButtons.push(
      <button key={trip.uuid} onClick={() => setSelectedTrip(i)}>
        <small>Trip {i + 1}</small>
        <br />
        {trip.points}
      </button>
    );
  });

  // Highlight the selected Trip
  if (selectedTrip > jamScore.trips.length) {
    const newSelectedTrip = jamScore.trips.length;
    setSelectedTrip(newSelectedTrip);
    tripButtons[newSelectedTrip].props.className = "activeTrip";
  } else {
    tripButtons[selectedTrip].props.className = "activeTrip";
  }

  return (
    <>
      <div className="tripEdit" style={{ visibility: tripEditDialogVisibility }}>
        {tripEditDialog}
      </div>

      <div className="scrollBar">
        <button onClick={() => scroll("left")}>&lt;</button>

        <div ref={scrollBar} className="trips">
          {tripButtons}
        </div>

        <button onClick={() => scroll("right")}>&gt;</button>
      </div>
    </>
  );

}
JamTripEditor.propTypes = {
  uri: PropTypes.object.isRequired,
  jamScore: PropTypes.object.isRequired,
  team: PropTypes.string.isRequired,
  selectedTripState: PropTypes.object.isRequired
}

function AttributeCheckbox({ checked, disabled = false, onClick, children }) {
  return (
    <>
      {children} &nbsp;
      <input type="checkbox" checked={checked} disabled={disabled}
        onClick={onClick} />
    </>
  )
}
AttributeCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.string.isRequired
}


function JamScore({ uri, state, team }) {
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestTripIsSelected = useRef(true);

  // Ensure the new latest Trip is selected when adding a new Trip
  useEffect(() => {
    if (latestTripIsSelected.current) {
      setSelectedTrip(state.trips.length);
    }
  }, [state.trips]);
  useEffect(() => {
    latestTripIsSelected.current = (selectedTrip == state.trips.length)
  }, [selectedTrip, state.trips]);

  const setLead = useCallback(() =>
    sendRequest("setLead", { uri, team, lead: !state.lead }),
    [uri, team, state.lead]);
  const setLost = useCallback(() =>
    sendRequest("setLost", { uri, team, lost: !state.lost }),
    [uri, team, state.lost]);
  const setStarPass = useCallback(() => {
    const tripNum = state.starPass == null ? selectedTrip : null
    sendRequest("setStarPass", { uri, team, tripNum });
  }, [uri, team, state.starPass, selectedTrip]);

  // Render constants
  const leadChecked = state.lead;
  const leadDisabled = !state.isLeadEligible;
  const lostChecked = state.lost;
  const starPassChecked = state.starPass != null;

  return (
    <div className="tripComponent">

      <div className="tripInput">
        <JamPointButtons uri={uri} jamScore={state} team={team}
          selectedTrip={selectedTrip} />
      </div>

      <div>
        <JamTripEditor uri={uri} jamScore={state} team={team}
          selectedTripState={[selectedTrip, setSelectedTrip]} />
      </div>

      <div>
        <AttributeCheckbox checked={leadChecked} onClick={setLead}
          disabled={leadDisabled}>
          Lead
        </AttributeCheckbox>
        <br />
        <AttributeCheckbox checked={lostChecked} onClick={setLost}>
          Lost
        </AttributeCheckbox>
        <br />
        <AttributeCheckbox checked={starPassChecked} onClick={setStarPass}>
          Star Pass
        </AttributeCheckbox>
      </div>

    </div>
  );
}
JamScore.propTypes = {
  uri: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  team: PropTypes.string.isRequired
}

function JamController({ uri, jam }) {
  const startJam = useCallback(() => sendRequest("startJam", { uri }), [uri]);
  const stopJam = useCallback(() => sendRequest("stopJam", { uri }), [uri]);
  const setJamStopReason = useCallback((stopReason) =>
    sendRequest("setJamStopReason", { uri, stopReason }), [uri]);
  const callTimeout = useCallback(() => sendRequest("callTimeout", {}), [])

  // Render constants
  const jamIsStarted = jam.startTime != null;
  const jamIsFinished = jam.stopTime != null;

  if (!jamIsStarted) {
    return (
      <>
        <button onClick={startJam}>Start Jam</button>
        <button onClick={callTimeout}>Timeout/OR</button>
      </>
    );
  } else if (!jamIsFinished) {
    return (
      <button onClick={stopJam}>Stop Jam</button>
    );
  } else {
    // Stop reason button render constants
    const calledDisabled = jam.stopReason == CALLED;
    const timeDisabled = jam.stopReason == TIME;
    const injuryDisabled = jam.StopReason == INJURY;

    return (
      <>
        Set stop reason: &nbsp;
        <button onClick={() => setJamStopReason(CALLED)}
          disabled={calledDisabled}>Called</button>
        <button onClick={() => setJamStopReason(TIME)}
          disabled={timeDisabled}>Time</button>
        <button onClick={() => setJamStopReason(INJURY)}
          disabled={injuryDisabled}>Injury</button>
      </>
    );
  }
}
JamController.propTypes = {
  uri: PropTypes.object.isRequired,
  jam: PropTypes.object.isRequired,
}

function TimeoutController({ timeout }) {
  const setTimeout = useCallback(() => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.isOfficialReview = false;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const setOfficialReview = useCallback(() => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.isOfficialReview = true;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const setCaller = useCallback((caller) => {
    const newTimeoutState = { ...timeout };
    newTimeoutState.caller = caller;
    sendRequest("setTimeout", newTimeoutState);
  }, [timeout]);

  const endTimeout = useCallback(() => {
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