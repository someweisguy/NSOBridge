import { useCallback, useState, useRef, useEffect } from "react";
import { onEvent, sendRequest } from "../App";
import "./JamComponent.css"

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
  activeStoppage: null,
  home: {
    officialReviewRemaining: 1,
    timeoutsRemaining: 3
  },
  away: {
    officialReviewRemaining: 1,
    timeoutsRemaining: 3
  }
}

export function ScoreboardEditor({ boutId = "0" }) {
  const [uri, setUri] = useState(null);
  const [period, setPeriod] = useState(null);
  const [jam, setJam] = useState(null);
  const [clockStoppage, setClockStoppage] = useState(NULL_STOPPAGE);

  useEffect(() => {
    let ignore = false;
    sendRequest("bout", { uri: { bout: boutId } })
      .then((newBout) => {
        if (!ignore) {
          const newUri = {
            bout: boutId, period: newBout.periodCount - 1,
            jam: newBout.currentJamNum
          };
          sendRequest("period", { uri: newUri }).then((newPeriod) => setPeriod(newPeriod));
          sendRequest("jam", { uri: newUri }).then((newJam) => setJam(newJam));
          // TODO: add current timeout to bout API
          setUri(newUri);
        }
      });
    sendRequest("clockStoppage", { uri: { bout: boutId } })
      .then((newClockState) => {
        if (!ignore) {
          setClockStoppage(newClockState);
        }
      });
    return () => ignore = true;
  }, [boutId]);

  useEffect(() => {
    const unsubscribeStoppage = onEvent("clockStoppage", (newStoppage) => {
      setClockStoppage(newStoppage);
    });
    return unsubscribeStoppage;
  }, []);
  useEffect(() => {
    if (period === null || jam === null) {
      return;
    }
    const unsubscribePeriod = onEvent("period", (newPeriod) => {
      if (newPeriod.uuid === period.uuid) {
        setPeriod(newPeriod);
      }
    });
    const unsubscribeJam = onEvent("jam", (newJam) => {
      if (newJam.uuid === jam.uuid) {
        setJam(newJam);
      }
    });
    return () => {
      unsubscribePeriod();
      unsubscribeJam();
    };
  }, [period, jam])

  const goToNextJam = useCallback(() => {
    const newUri = { ...uri };
    newUri.jam++;
    sendRequest("jam", { uri: newUri })
      .then((newJam) => {
        setJam(newJam);
        setUri(newUri);
      })
  }, [uri]);

  const goToNextPeriod = useCallback(() => {
    const newUri = { ...uri };
    newUri.period++;
    sendRequest("period", { uri: newUri })
      .then((newPeriod) => {
        setJam(newPeriod);
        setUri(newUri);
      })
  }, [uri]);

  const readyForNextJam = jam?.stopReason !== null;
  const readyForNextPeriod = period?.clock?.elapsed > period?.clock?.alarm
    && !jam?.clock?.running;

  const clockIsStopped = clockStoppage?.activeStoppage !== null;

  return (
    <div>
      {uri && ("P" + (uri.period + 1) + " J" + (uri.jam + 1))}
      {readyForNextJam && <button onClick={goToNextJam}>Next Jam</button>}
      {readyForNextPeriod && <button onClick={goToNextPeriod}>Next Period</button>}
      <br />
      {clockIsStopped ? (
        <TimeoutController stoppage={clockStoppage} />
      ) : (
        <JamController uri={uri} hasStarted={jam?.hasStarted}
          jamClock={jam?.clock} stopReason={jam?.stopReason} />
      )}
      <div>
        <JamScore uri={uri} team={HOME} />
        <JamScore uri={uri} team={AWAY} />
      </div>
    </div>
  );
}

function JamScore({ uri, team }) {
  const [state, setState] = useState(NULL_JAM_SCORE);
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestTripIsSelected = useRef(true);
  const scrollBar = useRef(null);

  // Request new data when the Jam changes
  useEffect(() => {
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

  useEffect(() => {
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
  useEffect(() => {
    if (latestTripIsSelected.current) {
      setSelectedTrip(state.trips.length);
    }
  }, [state.trips]);
  useEffect(() => {
    latestTripIsSelected.current = selectedTrip === state.trips.length;
  }, [selectedTrip, state.trips]);

  // Scroll to the selected Trip
  useEffect(() => {
    const buttonWidth = scrollBar.current.children[0].offsetWidth;
    const scrollBarWidth = scrollBar.current.offsetWidth;
    const scrollOffset = (scrollBarWidth / 2) + (buttonWidth / 2);
    scrollBar.current.scrollLeft = (buttonWidth * selectedTrip) - scrollOffset;
  }, [selectedTrip])

  const setTrip = useCallback((tripNum, points, validPass = true) => {
    sendRequest("setTrip", { uri, team, tripNum, points, validPass });
  }, [uri, team]);

  const deleteTrip = useCallback((tripNum) => {
    sendRequest("deleteTrip", { uri, team, tripNum });
  }, [uri, team])

  const setLead = useCallback((lead) => {
    sendRequest("setLead", { uri, team, lead });
  }, [uri, team]);

  const setLost = useCallback((lost) => {
    sendRequest("setLost", { uri, team, lost });
  }, [uri, team]);

  const setStarPass = useCallback((tripNum) => {
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

function JamController({ uri, hasStarted, jamClock, stopReason }) {
  const isFinished = hasStarted && !jamClock?.running;

  const startJam = useCallback(() => {
    sendRequest("startJam", { uri });
  }, [uri]);

  const stopJam = useCallback(() => {
    sendRequest("stopJam", { uri });
  }, [uri]);

  const setJamStopReason = useCallback((stopReason) => {
    sendRequest("setJamStopReason", { uri, stopReason });
  }, [uri]);

  const callTimeout = useCallback(() => {
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

function TimeoutController({ stoppage }) {
  const setTimeout = useCallback(() => {
    const payload = { ...stoppage.activeStoppage };
    payload.isOfficialReview = false;
    sendRequest("setTimeout", payload);
  }, [stoppage.activeStoppage]);

  const setOfficialReview = useCallback(() => {
    const payload = { ...stoppage.activeStoppage };
    payload.isOfficialReview = true;
    sendRequest("setTimeout", payload);
  }, [stoppage.activeStoppage]);

  const setCaller = useCallback((caller) => {
    const payload = { ...stoppage.activeStoppage };
    payload.caller = caller;
    sendRequest("setTimeout", payload);
  }, [stoppage.activeStoppage]);

  const endTimeout = useCallback(() => {
    sendRequest("endTimeout");
  }, []);

  const timeout = stoppage.activeStoppage;

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