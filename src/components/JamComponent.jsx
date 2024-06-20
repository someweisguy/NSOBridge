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
  const jamHandler = useCallback((newJamState) => {
    if (newJamState.index === state.index || state.index === null) {
      setState(newJamState);
    }
  }, []);
  useSocketGetter("jam", jamHandler);

  const periodLabel = state.index !== null ? "P" + (state.index[0] + 1) : null;
  const jamLabel = state.index !== null ? "J" + (state.index[1] + 1) : null;

  return (
    <div>
      {periodLabel}&nbsp;{jamLabel}
      <div style={{ display: "flex" }}>
        <div>
          <TripEditor team={HOME} trips={state.home.trips} />
          <JammerState team={HOME} jamState={state.home}
            numTrips={state.home.trips.length}
            isLeadEligible={!state.away.lead} />
        </div>
        <div>
          <TripEditor team={AWAY} trips={state.away.trips} />
          <JammerState team={AWAY} jamState={state.away}
            numTrips={state.away.trips.length}
            isLeadEligible={!state.home.lead} />
        </div>
      </div>
    </div>
  );
}

function TripEditor({ team, trips }) {
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
          tripPoints: 0
        })
      }>
        NP/NP
      </button>
    );
    tripScoreButtons.push(
      <button key={-2} className={className} onClick={() =>
        sendRequest("setInitialPass", {
          team: team
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
            tripPoints: i
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
          tripIndex: selectedTrip
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


function JammerState({ team, jamState, numTrips, isLeadEligible }) {
  const { lead, lost, starPass } = jamState;
  return (
    <div>
      <div>
        Lead&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setLead", {
            team: team,
            lead: !lead
          })}
          disabled={!isLeadEligible || lost}
          checked={lead} />
      </div>
      <div>
        Lost&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setLost", {
            team: team,
            lost: !lost
          })}
          checked={lost} />
      </div>
      <div>
        Star Pass&nbsp;<input type="checkbox"
          onClick={() => sendRequest("setStarPass", {
            team: team,
            tripIndex: (starPass === false ? numTrips : false)
          })}
          checked={starPass !== false} />
      </div>
    </div>
  );
}