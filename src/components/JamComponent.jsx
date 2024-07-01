import { useCallback, useState, useRef, useEffect, Suspense, lazy } from "react";
import { old_sendRequest, sendRequest } from "../App";
import "./JamComponent.css"

const HOME = "home";
const AWAY = "away";

const NULL_JAM = {
  jamId: {
    period: 0,
    jam: 0
  },
  countdown: {
    alarm: 0,
    elapsed: 0,
    running: false
  },
  clock: {
    alarm: 0,
    elapsed: 0,
    running: false
  },
  stopReason: null,
  // jamIndex: null,
  // home: {
  //   team: HOME,
  //   lead: false,
  //   lost: false,
  //   starPass: false,
  //   trips: []
  // }, away: {
  //   team: AWAY,
  //   lead: false,
  //   lost: false,
  //   starPass: false,
  //   trips: []
  // }
};

const NULL_JAM_SCORE = {
  trips: [], 
  lead: false,
  lost: false,
  starPass: null,
  isLeadEligible: true
};

export function PeriodViewer({ periodId = 0 }) {
  const [jamId, setJamId] = useState(null);

  useEffect(() => {
    let ignore = false;
    sendRequest("period", { periodId })
      .then((response) => {
        if (!ignore) {
          setJamId({ period: periodId, jam: response.jamCount - 1 });
        }
      }, (error) => {
        // Ignore errors
      });
    
    return () => ignore = true;
  }, []);


  return (
    <div>
        <Suspense fallback={"Loading..."}>
          <JamComponent jamId={jamId} team={HOME} />
        </Suspense>
    </div>
  );
}

export function JamComponent({ jamId, team }) {
  const [state, setState] = useState(NULL_JAM_SCORE)

  useEffect(() => {
    let ignore = false;
    sendRequest("jamScore", { jamId, team })
      .then((response) => {
        if (!ignore && response[team]) {
          setState(response[team]);
        }
      }, (error) => {
        // Ignore errors
      });
    
    return () => ignore = true;
  }, [jamId, team]);


  
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