import "./JamComponent.css"
import { React, useState, useEffect, useRef, useCallback, Suspense } from "react";
import { sendRequest } from "../client.js";
import { useBout, useJam, ACTION_CLOCK, GAME_CLOCK, useJamNavigation } from "../customHooks.jsx";
import Clock from "./TimerComponent.jsx"

const HOME = "home";
const AWAY = "away";
const OFFICIAL = "official";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";


export function ScoreboardEditor({ boutUuid }) {
  const bout = useBout(boutUuid);
  const [uri, setUri] = useState({
    bout: boutUuid,
    period: bout.currentPeriodNum,
    jam: bout.periods[bout.currentPeriodNum].jamCount - 1
  });
  const [previousUri, nextUri] = useJamNavigation(uri);

  // Ensure the Jam URI is valid
  useEffect(() => {
    const period = bout.currentPeriodNum;
    const jamDoesNotExist = uri?.jam >= bout.periods[period].jamCount;
    if (jamDoesNotExist) {
      // TODO: notify the user that the Jam does not exist
    }
    if (uri == null || jamDoesNotExist) {
      const jam = bout.periods[period].jamCount - 1;
      setUri({ bout: boutUuid, period, jam })
      return;
    }
  }, [bout]);

  return (
    <div>

      <div>
        Game: <Clock bout={bout} type={GAME_CLOCK} />
        <br />
        Action: <Clock bout={bout} type={ACTION_CLOCK} />
        <br />
        <PeriodController uri={uri} />
        <br />
        <TimeoutController bout={bout} />
      </div>

      <div>
        <p>
          {previousUri != null &&
            <button onClick={() => setUri(previousUri)}>&lt;</button>
          }
          P{uri.period + 1} J{uri.jam + 1}
          {nextUri != null &&
            <button onClick={() => setUri(nextUri)}>&gt;</button>
          }
        </p>
      </div>

      <Suspense>
        <div>
          <JamController uri={uri} />
        </div>
        <div>
          <JamScore uri={uri} team={HOME} />
          <JamScore uri={uri} team={AWAY} />
        </div>
      </Suspense>

    </div>
  );
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


function AttributeCheckbox({ checked, disabled = false, onClick, children }) {
  return (
    <>
      {children} &nbsp;
      <input type="checkbox" checked={checked} disabled={disabled}
        onClick={onClick} />
    </>
  )
}


function JamScore({ uri, team }) {
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestTripIsSelected = useRef(true);
  const state = useJam(uri).score[team];

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


function JamController({ uri }) {
  const startLineup = useCallback(() => sendRequest("beginPeriod", { uri }, 
    [uri]));
  const startJam = useCallback(() => sendRequest("startJam", { uri }), [uri]);
  const stopJam = useCallback(() => sendRequest("stopJam", { uri }), [uri]);
  const setJamStopReason = useCallback((stopReason) =>
    sendRequest("setJamStopReason", { uri, stopReason }), [uri]);
  const jam = useJam(uri);

  const bout = useBout(uri);

  // Render constants
  const jamIsStarted = jam.startTime != null;
  const jamIsFinished = jam.stopTime != null;

  if (!jamIsStarted) {
    const showLineup = (bout.periods[bout.currentPeriodNum].startTime == null
      && !bout.clocks.lineup.isRunning);
    const disabled = (bout.timeout.current != null);
    return (
      <>
        {showLineup && 
          <button onClick={startLineup} disabled={disabled}>
            Start Lineup
          </button> 
        }
        <button onClick={startJam} disabled={disabled}>Start Jam</button>
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

function PeriodController({ uri }) {
  const bout = useBout(uri.bout);

  const startIntermission = useCallback(() =>
    sendRequest("startIntermission", { uri }), [uri])
  const stopIntermission = useCallback(() =>
    sendRequest("stopIntermission", { uri }), [uri])
  const endPeriod = useCallback(() =>
    sendRequest("endPeriod", { uri }), [uri]);

  const periodHasStarted = bout.clocks.lineup.isRunning
    || bout.clocks.jam.isRunning || bout.clocks.timeout.isRunning;

  if (!periodHasStarted) {
    const intermissionIsRunning = bout.clocks.intermission.isRunning;
    const intermissionText = bout.currentPeriodNum == 0 ? "Time to Derby"
      : "Halftime"
    return (
      <>
        {!intermissionIsRunning ?
          <button onClick={startIntermission}>Start {intermissionText}</button>
          : <button onClick={stopIntermission}>Stop {intermissionText}</button>
        }
      </>
    );
  } else {
    const disabled = bout.clocks.period.elapsed < bout.clocks.period.alarm
      || bout.clocks.jam.isRunning;
    return (
      <button disabled={disabled} onClick={endPeriod}>
        End Period
      </button>
    );
  }

}

function TimeoutController({ bout }) {
  const callTimeout = useCallback(() => {
    const uri = { bout: bout.uuid }
    sendRequest("callTimeout", { uri });
  }, [bout]);

  const setIsOfficialReview = useCallback((isOfficialReview) => {
    const uri = { bout: bout.uuid };
    sendRequest("setTimeoutIsOfficialReview", { uri, isOfficialReview });
  }, [bout]);

  const setTeam = useCallback((team) => {
    const uri = { bout: bout.uuid };
    sendRequest("assignTimeout", { uri, team });
  }, [bout]);

  const endTimeout = useCallback(() => {
    const uri = { bout: bout.uuid }
    sendRequest("endTimeout", { uri });
  }, [bout]);

  if (bout.timeout.current == null) {
    const canCallTimeout = !bout.clocks.jam.isRunning;
    return (
      <div>
        <button onClick={callTimeout} disabled={!canCallTimeout}>
          Call Timeout
        </button>
      </div>
    );
  } else {
    const timeout = bout.timeout.current;
    return (
      <div>
        <span>
          <button onClick={() => setIsOfficialReview(false)}
            disabled={!timeout.isOfficialReview}>
            Timeout
          </button>
          <button onClick={() => setIsOfficialReview(true)}
            disabled={timeout.isOfficialReview || timeout.team === OFFICIAL}>
            Official Review
          </button>
        </span>
        &nbsp;
        <span>
          <button onClick={() => setTeam(HOME)}
            disabled={timeout.team === HOME}>
            Home
          </button>
          <button onClick={() => setTeam(OFFICIAL)}
            disabled={timeout.team === OFFICIAL || timeout.isOfficialReview}>
            Official
          </button>
          <button onClick={() => setTeam(AWAY)}
            disabled={timeout.team === AWAY}>
            Away
          </button>
        </span>
        &nbsp;
        <span>
          <button onClick={endTimeout}>
            End {timeout.isOfficialReview ? "O/R" : "T/O"}
          </button>
        </span>
      </div>
    );
  }
}


// TODO
// function IntermissionController({ uri }) {


//   return (
//     <>
//     </>
//   );
// }
// IntermissionController.propTypes = {
//   uri: PropTypes.object.isRequired
// }