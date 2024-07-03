import { useCallback, useState, useRef, useEffect, Suspense, lazy } from "react";
import { old_sendRequest, onEvent, sendRequest } from "../App";
import "./JamComponent.css"

const HOME = "home";
const AWAY = "away";

const NULL_TIMER = {
  alarm: 0,
  elapsed: -1,
  running: false,
}

const NULL_PERIOD = {
  id: 0,
  countdown: NULL_TIMER,
  clock: NULL_TIMER,
  jamCount: 1
};

const NULL_JAM = {
  id: {
    period: 0,
    jam: 0
  },
  countdown: NULL_TIMER,
  clock: NULL_TIMER,
  stopReason: null
}

const NULL_JAM_SCORE = {
  id: {
    period: 0,
    jam: 0
  },
  trips: [],
  lead: false,
  lost: false,
  starPass: null,
  isLeadEligible: true
};

export function PeriodViewer({ periodCount = 1 }) {
  const [state, setState] = useState(NULL_PERIOD);

  useEffect(() => {
    let ignore = false;
    sendRequest("period", { id: periodCount - 1 })
      .then((newState) => {
        if (!ignore) {
          console.log(newState);
          setState(newState)
        }
      }, (error) => {
        console.error(error);
      });

    return () => ignore = true;
  }, []);

  useEffect(() => {
    if (state.id === null) {
      return;
    }
    const unsubscribe = onEvent("period", (newState) => {
      if (newState.id == state.id) {
        console.log(data);
        setState(newState);
      }
    });
    return () => unsubscribe();
  }, [state.id])


  return (
    <div>
      <Suspense fallback={"Loading..."}>
        <JamComponent period={state.id} jamCount={state.jamCount} />
      </Suspense>
    </div>
  );
}

export function JamComponent({ period, jamCount }) {
  const [state, setState] = useState(NULL_JAM_SCORE)

  useEffect(() => {
    let ignore = false;
    sendRequest("jam", { id: { period, jam: jamCount - 1 } })
      .then((newState) => {
        if (!ignore) {
          console.log(newState);
          setState(newState)
        }
      }, (error) => {
        console.error(error);
      });

    return () => ignore = true;
  }, []);

  useEffect(() => {
    if (state.id === null) {
      return;
    }
    const unsubscribe = onEvent("jam", (newState) => {
      if (newState.id.period == period && newState.id.jam == state.id.jam) {
        console.log(data);
        setState(newState);
      }
    });
    return () => unsubscribe();
  }, [period, state.id])

  return (
    <div>
      <JamScore id={state.id} team={HOME} />
    </div>
  );
}

function JamScore({ id, team }) {
  const [state, setState] = useState(NULL_JAM_SCORE);
  const [activeTrip, setSelectedTrip] = useState(0);

console.log(id);

  useEffect(() => {
    let ignore = false;
    sendRequest("jamScore", { id, team })
      .then((newState) => {
        if (!ignore) {
          console.log(newState);
          setState(newState)
        }
      }, (error) => {
        console.error(error);
      });

    return () => ignore = true;
  }, []);

  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );

}

function TeamJamScore({ jamId, team, state, isLeadEligible = false }) {
  // const [state, setState] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestTripIsSelected = useRef(true);
  const scrollBar = useRef(null);

  // Ensure the new latest Trip is selected when adding a new Trip
  useEffect(() => {
    if (latestTripIsSelected.current) {
      setSelectedTrip(state.trips.length);
    }
  }, [state]);
  useEffect(() => {
    latestTripIsSelected.current = selectedTrip === state.trips.length;
  }, [selectedTrip]);

  // Scroll to the selected Trip
  useEffect(() => {
    const buttonWidth = scrollBar.current.children[0].offsetWidth;
    const scrollBarWidth = scrollBar.current.offsetWidth;
    const scrollOffset = (scrollBarWidth / 2) + (buttonWidth / 2);
    scrollBar.current.scrollLeft = (buttonWidth * selectedTrip) - scrollOffset;
  }, [selectedTrip])

  const setTrip = useCallback((tripIndex, tripPoints, validPass = true) => {
    old_sendRequest("setTrip", { jamIndex: jamId, team, tripIndex, tripPoints, validPass });
  }, [jamId, team]);

  const deleteTrip = useCallback((tripIndex) => {
    old_sendRequest("deleteTrip", { jamIndex: jamId, team, tripIndex })
  }, [jamId, team])

  const setLead = useCallback((lead) => {
    old_sendRequest("setLead", { jamIndex: jamId, team, lead })
  }, [jamId, team]);

  const setLost = useCallback((lost) => {
    old_sendRequest("setLost", { jamIndex: jamId, team, lost })
  }, [jamId, team]);

  const setStarPass = useCallback((tripIndex) => {
    old_sendRequest("setStarPass", { jamIndex: jamId, team, tripIndex })
  }, [jamId, team, selectedTrip]);

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
            disabled={!isLeadEligible || state.lost} />
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

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

export function JamControlComponent({ isStarted, stopReason, jamIndex }) {
  const isStopped = stopReason !== null;

  let label = null;
  const buttons = [];
  if (!isStarted) {
    buttons.push(
      <button onClick={() => old_sendRequest("startJam", {
        jamIndex
      })}>Start Jam</button>
    );
  } else if (!isStopped) {
    buttons.push(
      <button onClick={() => old_sendRequest("stopJam", {
        jamIndex
      })}>Stop Jam</button>
    );
  } else {
    label = (<small>Set stop reason: </small>);
    buttons.push(
      <button onClick={() => old_sendRequest("setJamStopReason", {
        jamIndex,
        stopReason: CALLED,
      })}
        disabled={stopReason === CALLED}>Called</button>
    );
    buttons.push(
      <button onClick={() => old_sendRequest("setJamStopReason", {
        jamIndex,
        stopReason: TIME
      })}
        disabled={stopReason === TIME}>Time</button>
    );
    buttons.push(
      <button onClick={() => old_sendRequest("setJamStopReason", {
        jamIndex,
        stopReason: INJURY
      })}
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