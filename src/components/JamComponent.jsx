import { useCallback, useState, useRef, useEffect } from "react";
import { useSocketGetter, sendRequest } from "../App";
import "./JamComponent.css"

const HOME = "home";
const AWAY = "away";

const NULL_JAM = {
  startTime: null,
  stopTime: null,
  stopReason: null,
  index: null,
  home: {
    team: HOME,
    lead: false,
    lost: false,
    starPass: false,
    trips: []
  }, away: {
    team: AWAY,
    lead: false,
    lost: false,
    starPass: false,
    trips: []
  }
};

export function JamComponent({ }) {
  const [state, setState] = useState(NULL_JAM);
  const jamHandler = useCallback((newState) => {
    if (state.index === null || (newState.index.period === state.index.period
      && newState.index.jam === state.index.jam)) {
      setState(newState);
    }
  }, [state]);
  useSocketGetter("jam", jamHandler);

  // Instantiate Jam labels
  let [periodLabel, jamLabel] = [null, null];
  if (state.index !== null) {
    periodLabel = "P" + (state.index.period + 1);
    jamLabel = "J" + (state.index.jam + 1);
  }

  // Instantiate next Jam button
  let nextJamButton = null;
  if (state.stopReason !== null) {
    nextJamButton = (<button onClick={async () => {
      let index = state.index;
      index.jam += 1;
      const nextState = await sendRequest("jam", {
        periodIndex: index.period,
        jamIndex: index.jam
      });
      setState(nextState);
    }}>Go to next Jam</button>);
  }

  return (
    <div>
      {nextJamButton}
      {periodLabel}&nbsp;{jamLabel}
      <br />
      <JamControlComponent startTime={state.startTime}
        stopReason={state.stopReason} index={state.index} />
      <div style={{ display: "flex" }}>
        <div>
          <TripEditor team={HOME} trips={state.home.trips} index={state.index} />
          <JammerState team={HOME} jamState={state.home} index={state.index}
            numTrips={state.home.trips.length}
            isLeadEligible={!state.away.lead} />
        </div>
        <div>
          <TripEditor team={AWAY} trips={state.away.trips} index={state.index} />
          <JammerState team={AWAY} jamState={state.away} index={state.index}
            numTrips={state.away.trips.length}
            isLeadEligible={!state.home.lead} />
        </div>
      </div>
    </div>
  );
}

function TripEditor({ team, trips, index }) {
  const [selectedTrip, setSelectedTrip] = useState(0);
  const latestIsSelected = useRef(true);
  const scrollBar = useRef(null);

  // Ensure the new latest Trip is selected when adding a new Trip
  useEffect(() => {
    if (latestIsSelected.current && selectedTrip != trips.length) {
      setSelectedTrip(trips.length);
    }
    latestIsSelected.current = selectedTrip === trips.length;
  }, [selectedTrip, trips]);

  // Scroll the Trips scrollbar the width of a Trip button
  const scroll = useCallback((direction) => {
    const buttonWidth = scrollBar.current.children[0].offsetWidth;
    switch (direction) {
      case "left":
        scrollBar.current.scrollLeft -= buttonWidth;
        break;
      case "right":
        scrollBar.current.scrollLeft += buttonWidth;
        break;
      case "selectedTrip":
        // Scroll the selected Trip to the middle of the Trip scrollbar
        const scrollBarWidth = scrollBar.current.offsetWidth;
        const scrollOffset = (scrollBarWidth / 2) + (buttonWidth / 2);
        scrollBar.current.scrollLeft = (buttonWidth * selectedTrip) - scrollOffset;
        break;
      default:
        throw new Error("Direction must be either 'left', 'right', or 'selectedTrip'.");
    }
  }, [scrollBar, selectedTrip]);

  // Scroll the Trips scrollbar to the selected Trip
  useEffect(() => {
    scroll("selectedTrip");
  }, [selectedTrip]);

  // Render the Trip score buttons
  const tripScoreButtons = [];
  if (selectedTrip === 0) {
    // Render No-Pass/No-Penalty and Initial Pass buttons
    const className = "initial";
    tripScoreButtons.push(
      <button key={-1} className={className} onClick={() =>
        sendRequest("setTrip", {
          team: team,
          tripIndex: selectedTrip,
          tripPoints: 0,
          periodIndex: index.period,
          jamIndex: index.jam
        })
      }>
        NP/NP
      </button>
    );
    tripScoreButtons.push(
      <button key={-2} className={className} onClick={() =>
        sendRequest("setInitialPass", {
          team: team,
          periodIndex: index.period,
          jamIndex: index.jam
        })
      }>
        Initial
      </button>
    );
  } else {
    // When editing a Trip disable the score button of the current Trip points
    let disableIndex = null;  // Enable all by default
    if (selectedTrip < trips.length) {
      disableIndex = trips[selectedTrip].points;
    }

    // Instantiate the Trip point buttons
    for (let i = 0; i <= 4; i++) {
      tripScoreButtons.push(
        <button key={i} className="points" disabled={i === disableIndex}
          onClick={() => sendRequest("setTrip", {
            team: team,
            tripIndex: selectedTrip,
            tripPoints: i,
            periodIndex: index.period,
            jamIndex: index.jam
          })}>
          {i}
        </button>
      );
    }
  }

  // Render each trip as a button
  const tripButtons = [];
  for (let i = 0; i <= trips.length; i++) {
    tripButtons.push(
      <button key={i} onClick={() => {
        latestIsSelected.current = (i === trips.length);
        setSelectedTrip(i);
      }}>
        <small>Trip {i + 1}</small>
        <br />{i < trips.length ? trips[i].points : "\u00A0"}
      </button>
    );
  }
  if (selectedTrip <= trips.length) {
    tripButtons[selectedTrip].props.className = "activeTrip";
  }

  // Determine if the "delete trip" button is visible
  let visibility = "hidden";
  if (selectedTrip < trips.length && (selectedTrip > 0 || trips.length === 1)) {
    visibility = "visible";
  }

  return (
    <div className="tripComponent">

      <div className="tripInput">
        {tripScoreButtons}
      </div>

      <div className="tripEdit" style={{ visibility: visibility }}>
        Editing trip {selectedTrip + 1}.&nbsp;
        <button onClick={() => sendRequest("deleteTrip", {
          team: team,
          tripIndex: selectedTrip,
          periodIndex: index.period,
          jamIndex: index.jam
        })}>Delete</button>
      </div>

      <div className="scrollBar">
        <button onClick={() => scroll("left")}>&lt;</button>
        <div ref={scrollBar} className="trips">
          {tripButtons}
        </div>
        <button onClick={() => scroll("right")}>&gt;</button>
      </div>

    </div>
  );
}


function JammerState({ team, jamState, index, numTrips, isLeadEligible }) {
  const { lead, lost, starPass } = jamState;
  return (
    <div>
      <div>
        Lead&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setLead", {
            team: team,
            lead: !lead,
            periodIndex: index.period,
            jamIndex: index.jam
          })}
          disabled={!isLeadEligible || lost}
          checked={lead} />
      </div>
      <div>
        Lost&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setLost", {
            team: team,
            lost: !lost,
            periodIndex: index.period,
            jamIndex: index.jam
          })}
          checked={lost} />
      </div>
      <div>
        Star Pass&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setStarPass", {
            team: team,
            tripIndex: (starPass === false ? numTrips : false),
            periodIndex: index.period,
            jamIndex: index.jam
          })}
          checked={starPass !== false} />
      </div>
    </div>
  );
}

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

export function JamControlComponent({ startTime, stopReason, index }) {

  const isStarted = startTime !== false;
  const isStopped = stopReason !== null;

  let label = null;
  const buttons = [];
  if (!isStarted) {
    buttons.push(
      <button onClick={() => sendRequest("startJam", {
        periodIndex: index.period,
        jamIndex: index.jam
      })}>Start Jam</button>
    );
  } else if (!isStopped) {
    buttons.push(
      <button onClick={() => sendRequest("stopJam", {
        periodIndex: index.period,
        jamIndex: index.jam
      })}>Stop Jam</button>
    );
  } else {
    label = (<small>Set stop reason: </small>);
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", {
        stopReason: CALLED,
        periodIndex: index.period,
        jamIndex: index.jam
      })}
        disabled={stopReason === CALLED}>Called</button>
    );
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", {
        stopReason: TIME,
        periodIndex: index.period,
        jamIndex: index.jam
      })}
        disabled={stopReason === TIME}>Time</button>
    );
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", {
        stopReason: INJURY,
        periodIndex: index.period,
        jamIndex: index.jam
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