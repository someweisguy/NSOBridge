import { useCallback, useState, useRef, useEffect } from "react";
import { onEvent, sendRequest } from "../App";
import "./JamComponent.css"

const HOME = "home";
const AWAY = "away";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

const NULL_BOUT = {
  id: null,
  periodCount: null,
}

const NULL_PERIOD = {
  id: null,
  countdown: null,
  clock: null,
  jamCount: 1
};

const NULL_JAM = {
  id: null,
  countdown: null,
  clock: null,
  stopReason: null
}

const NULL_JAM_SCORE = {
  id: null,
  trips: [],
  lead: false,
  lost: false,
  starPass: null,
  isLeadEligible: true
};

export function ScoreboardEditor({ boutId = 0 }) {
  const [jamId, setJamId] = useState(null);
  const [boutState, setBoutState] = useState(NULL_BOUT);
  const [periodState, setPeriodState] = useState(NULL_PERIOD);
  const [jamState, setJamState] = useState(NULL_JAM);

  useEffect(() => {
    if (boutId === null) {
      return;
    }
    let ignore = false;
    sendRequest("bout", { id: boutId })
      .then((newBoutState) => {
        if (!ignore) {
          setBoutState(newBoutState);
        }
      });

    // Update the Jam ID to the latest jam
    // TODO: make this part of the "bout" API
    sendRequest("jam", { id: null })
      .then((newJamState) => {
        if (!ignore) {
          setJamId(newJamState.id);
        }
      });
    return () => ignore = true;
  }, [boutId]);

  
  useEffect(() => {
    if (jamId === null) {
      return;
    }
    let ignore = false;
    if (jamId.period !== periodState.id) {
      sendRequest("period", { id: jamId.period })
        .then((newPeriodState) => {
          if (!ignore) {
            setPeriodState(newPeriodState);
          }
        });
    }
    if (jamId.jam !== jamState.id?.jam) {
      sendRequest("jam", { id: jamId })
        .then((newJamState) => {
          if (!ignore) {
            setJamState(newJamState);
          }
        });
    }

    const unsubscribePeriod = onEvent("period", (newPeriodState) => {
      if (newPeriodState.id.period === jamId.period) {
        setPeriodState(newPeriodState);
      }
    });

    const unsubscribeJam = onEvent("jam", (newJamState) => {
      if (newJamState.id.period === jamId.period
        && newJamState.id.jam === jamId.jam) {
        setJamState(newJamState);
      }
    });

    return () => {
      ignore = true;
      unsubscribePeriod();
      unsubscribeJam();
    };
  }, [jamId])

  const goToNextJam = useCallback(() => {
    const newJamId = {...jamId};
    newJamId.jam++;
    setJamId(newJamId);
  }, [jamId]);

  const readyForNextJam = jamState.stopReason !== null;

  return (
    <div>
      {jamState.id && ("P" + (jamState.id.period + 1) + " J" + (jamState.id.jam + 1))}
      {readyForNextJam && <button onClick={goToNextJam}>Next Jam</button>}
      <br />
      <JamController id={jamId} jamClock={jamState.clock}
        stopReason={jamState.stopReason} />
      <div>
        <JamScore id={jamId} team={HOME} />
        <JamScore id={jamId} team={AWAY} />
      </div>
    </div>
  );
}

function JamScore({ id, team }) {
  const [state, setState] = useState(NULL_JAM_SCORE);
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestTripIsSelected = useRef(true);
  const scrollBar = useRef(null);

  // FIXME: find null pointer error

  // Request new data when the Jam changes
  useEffect(() => {
    if (id === null) {
      return;
    }
    let ignore = false;
    sendRequest("jamScore", { id, team })
      .then((newState) => {
        if (!ignore) {
          setState(newState)
        }
      });

    const unsubscribe = onEvent("jamScore", (newState) => {
      if (newState.id.period === id.period && newState.id.jam === id.jam
        && newState.team === team) {
        setState(newState);
      }
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [id, team]);

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

  const setTrip = useCallback((tripIndex, tripPoints, validPass = true) => {
    sendRequest("setTrip", { id, team, tripIndex, tripPoints, validPass });
  }, [id, team]);

  const deleteTrip = useCallback((tripIndex) => {
    sendRequest("deleteTrip", { id, team, tripIndex });
  }, [id, team])

  const setLead = useCallback((lead) => {
    sendRequest("setLead", { id, team, lead });
  }, [id, team]);

  const setLost = useCallback((lost) => {
    sendRequest("setLost", { id, team, lost });
  }, [id, team]);

  const setStarPass = useCallback((tripIndex) => {
    sendRequest("setStarPass", { id, team, tripIndex });
  }, [id, team, selectedTrip]);

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
      <button onClick={() => setSelectedTrip(i)}>
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

function JamController({ id, jamClock, stopReason }) {
  const isStarted = jamClock && jamClock.elapsed > 0;
  const isFinished = isStarted && stopReason !== null;

  const startJam = useCallback(() => {
    sendRequest("startJam", { id });
  }, [id]);

  const stopJam = useCallback(() => {
    sendRequest("stopJam", { id });
  }, [id]);

  const setJamStopReason = useCallback((stopReason) => {
    sendRequest("setJamStopReason", { id, stopReason });
  }, [id]);

  let label = null;
  const buttons = [];
  if (!isStarted) {
    buttons.push(
      <button onClick={startJam}>Start Jam</button>
    );
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
