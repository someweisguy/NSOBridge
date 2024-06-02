import { useEffect, useState, useRef, useCallback } from "react";
import { addConnectHandler, addRequestHandler, sendRequest } from "../App";
import "./JamComponent.css"

function useInterface(api, callbackFunction, constArgs) {
  useEffect(
    () => { return addRequestHandler(api, callbackFunction) },
    [api, callbackFunction]
  );

  useEffect(() => {
    return addConnectHandler(async () => {
      const response = await sendRequest(api, "get", constArgs);
      if (!response.error) {
        callbackFunction(response);
      }
    });
  }, [api, constArgs, callbackFunction]);
}


export function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, selectTrip] = useState(0);
  const lead = useRef(false);
  const lost = useRef(false);
  const starPass = useRef(null);
  const scrollBar = useRef(null);

  const tripsHandler = useCallback((payload) => {
    if (payload.data.team !== team) {
      return;
    }

    const newTrips = payload.data.trips;
    setTrips(newTrips);
    if (selectedTrip === trips.length) {
      selectTrip(newTrips.length);
    }

    lead.current = payload.data.lead;
    lost.current = payload.data.lost;
    starPass.current = payload.data.starPass;
  }, [team, selectedTrip, trips]);
  useInterface("jamTrips", tripsHandler, { team: team });

  useEffect(() => {
    // Scroll the Trips scrollbar to the selected Trip.
    const selectedTripButton = scrollBar.current.children[selectedTrip];
    selectedTripButton.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedTrip]);

  async function setPoints(points) {
    await sendRequest("jamTrips", "set", {
      team: team,
      tripIndex: selectedTrip,
      tripPoints: points
    });
  }

  async function deleteTrip() {
    await sendRequest("jamTrips", "del", {
      team: team,
      tripIndex: selectedTrip,
    });
  }

  async function setLead() {
    await sendRequest("jamLead", "set", {
      team: team,
      lead: !lead.current
    });
  }

  async function setLost() {
    await sendRequest("jamLost", "set", {
      team: team,
      lost: !lost.current
    });
  }


  async function setStarPass() {
    await sendRequest("jamStarPass", "set", {
      team: team,
      tripIndex: (starPass.current === false ? selectedTrip : false)
    });
  }

  function scroll(amount) {
    scrollBar.current.scrollLeft += amount;
  }

  // Render the points buttons
  const pointButtons = [];
  if (selectedTrip === 0) {
    // Render No-Pass/No-Penalty and Initial Pass buttons
    const className = "initial";
    pointButtons.push(
      <button key={-1} className={className} onClick={() => setPoints(0)}>
        NP/NP
      </button>
    );
    pointButtons.push(
      <button key={-2} className={className} onClick={() => setPoints(0)}>
        Initial
      </button>
    );
  } else {
    // When editing a Trip disable the point button of the current Trip points
    let disableIndex = null;  // Enable all by default
    if (selectedTrip < trips.length) {
      disableIndex = trips[selectedTrip].points;
    }

    // Instantiate the Trip point buttons
    for (let i = 0; i <= 4; i++) {
      pointButtons.push(
        <button key={i} className="points" disabled={i === disableIndex}
          onClick={() => setPoints(i)}>
          {i}
        </button>
      );
    }
  }

  // Render each trip as a button
  const tripButtons = [];
  for (let i = 0; i <= trips.length; i++) {
    tripButtons.push(
      <button key={i} onClick={() => selectTrip(i)}>
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
        {pointButtons}
      </div>

      <div className="tripEdit" style={{ visibility: visibility }}>
        Editing trip {selectedTrip + 1}. &nbsp;
        <button onClick={deleteTrip}>Delete</button>
      </div>

      <div className="scrollBar">
        <button onClick={() => scroll(-50)}>&lt;</button>
        <div ref={scrollBar} className="trips">
          {tripButtons}
        </div>
        <button onClick={() => scroll(50)}>&gt;</button>
      </div>

      <CheckboxComponent value={lead.current} onClick={setLead}>Lead Jammer</CheckboxComponent>
      <CheckboxComponent value={lost.current} onClick={setLost}>Lost Lead</CheckboxComponent>
      <CheckboxComponent value={starPass.current !== false} onClick={setStarPass}>Star Pass</CheckboxComponent>

    </div>
  );
}

function CheckboxComponent({ value, onClick, children }) {
  return (
    <div>
      {children}
      <input type="checkbox" onClick={onClick} checked={value}></input>
    </div>
  );
}