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
      const response = await sendRequest(api, constArgs);
      if (!response.error) {
        callbackFunction(response);
      }
    });
  }, [api, constArgs, callbackFunction]);
}


export function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, selectTrip] = useState(0);
  const [lead, setLead] = useState(false);
  const [lost, setLost] = useState(false);
  const [starPass, setStarPass] = useState(null);
  const scrollBar = useRef(null);

  const tripsHandler = useCallback((teamJam) => {
    if (teamJam.team !== team) {
      return;
    }
    setTrips(teamJam.trips);
    if (selectedTrip === trips.length) {
      selectTrip(teamJam.trips.length);
    }
  }, [team, selectedTrip, trips]);
  useInterface("getJamTrips", tripsHandler, { team: team });

  const leadHandler = useCallback((teamJam) => {
    if (teamJam.team !== team) {
      return;
    }
    setLead(teamJam.lead);
  }, [team]);
  useInterface("getJamLead", leadHandler, { team: team });

  const lostHandler = useCallback((teamJam) => {
    if (teamJam.team !== team) {
      return;
    }
    setLost(teamJam.lost);
  }, [team]);
  useInterface("getJamLost", lostHandler, { team: team });

  const starPassHandler = useCallback((teamJam) => {
    if (teamJam.team !== team) {
      return;
    }
    setStarPass(teamJam.starPass);
  }, [team]);
  useInterface("getJamStarPass", starPassHandler, { team: team });

  useEffect(() => {
    // Scroll the Trips scrollbar to the selected Trip.
    const selectedTripButton = scrollBar.current.children[selectedTrip];
    selectedTripButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedTrip]);

  async function setPoints(points) {
    await sendRequest("setJamTrips", {
      team: team,
      tripIndex: selectedTrip,
      tripPoints: points
    });
  }

  async function deleteTrip() {
    await sendRequest("delJamTrips", {
      team: team,
      tripIndex: selectedTrip,
    });
  }

  async function setLeadRequest() {
    await sendRequest("setJamLead", {
      team: team,
      lead: !lead
    });
  }

  async function setLostRequest() {
    await sendRequest("setJamLost", {
      team: team,
      lost: !lost
    });
  }


  async function setStarPassRequest() {
    await sendRequest("setJamStarPass", {
      team: team,
      tripIndex: (starPass === false ? selectedTrip : false)
    });
  }

  async function setInitial() {
    await sendRequest("setJamInitial", { team: team });
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
      <button key={-2} className={className} onClick={setInitial}>
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

      <CheckboxComponent value={lead} onClick={setLeadRequest} disabled={lost}>Lead Jammer</CheckboxComponent>
      <CheckboxComponent value={lost} onClick={setLostRequest}>Lost Lead</CheckboxComponent>
      <CheckboxComponent value={starPass !== false} onClick={setStarPassRequest}>Star Pass</CheckboxComponent>

    </div>
  );
}

function CheckboxComponent({ value, onClick, children, disabled = false }) {
  return (
    <div>
      {children}
      <input type="checkbox" onClick={onClick} disabled={disabled} checked={value}></input>
    </div>
  );
}