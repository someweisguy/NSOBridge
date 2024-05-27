import { useEffect, useState } from "react";
import { socket, getTick } from "../App";
import "./JamComponent.css"


function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(0);

  function updateTrips(data) {
    console.log(data);
    if (data.team != team) {
      return;
    }
    let newTrips = data.trips.map((trip) => trip.points);
    if (activeTrip == trips.length) {
      setActiveTrip(newTrips.length);
    }
    setTrips(newTrips)
  }

  useEffect(async () => {
    const apiCall = "getJamTrip";
    socket.on(apiCall, (payload) => { updateTrips(payload.data); });
    const response = await socket.emitWithAck(apiCall, { team: team });
    if (response && !response.error) {
      updateTrips(response.data);
    }

    return () => { socket.removeListener(apiCall); };
  }, []);

  async function setPoints(points) {
    const tick = getTick();
    const response = await socket.emitWithAck("setJamTrip",
      { team: team, tripIndex: activeTrip, tripPoints: points, tick: tick });
    if (response && !response.error) {
      updateTrips(response.data);
    }
  }

  // Render the points buttons
  const pointButtons = [];
  if (activeTrip == 0) {
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
    // Render trip point buttons
    const className = "points";
    const disableIndex = activeTrip < trips.length ? trips[activeTrip] : -1;
    for (let i = 0; i <= 4; i++) {
      const disabled = i == disableIndex;
      pointButtons.push(
        <button key={i} className={className} disabled={disabled} onClick={() => setPoints(i)}>
          {i}
        </button>
      );
    }
  }

  // Render each trip as a button
  const tripViewButtons = [];
  for (let i = 0; i <= trips.length; i++) {
    tripViewButtons.push(
      <button key={i} onClick={() => setActiveTrip(i)}>
        <small>Trip {i + 1}</small>
        <br />{i < trips.length ? trips[i] : "\u00A0"}
      </button>
    );
  }
  tripViewButtons[activeTrip].props.className = "activeTrip";

  // Determine if the "delete trip" button is visible
  let visibility = "hidden";
  if (activeTrip < trips.length && (activeTrip > 0 || trips.length == 1)) {
    visibility = "visible";
  }

  async function deleteTrip() {
    const tick = getTick()
    const response = await socket.emitWithAck("deleteJamTrip", { team: team, tripIndex: activeTrip, tick: tick })
    if (response && !response.error) {
      let newTrips = trips.filter((points, tripIndex) => tripIndex != activeTrip);
      setTrips(newTrips);
      if (activeTrip > 0) {
        setActiveTrip(activeTrip - 1);
      }
    }
  }

  return (
    <div className="tripComponent">
      
      <div className="tripInput">
        {pointButtons}
      </div>

      <div className="tripEdit" style={{ visibility: visibility }}>
        Editing trip {activeTrip + 1}. &nbsp;
        <button onClick={deleteTrip}>Delete</button>
      </div>

      <div className="scrollBar">
        <button>&lt;</button>
        <div className="trips">
          {tripViewButtons}
        </div>
        <button>&gt;</button>
      </div>
      
    </div>
  );
}

function LeadComponent({ periodIndex, jamIndex, team }) {

  return (
    <div style={{border: "1px solid black"}}>
      Hello world!
    </div>
  );
}


export function TeamJamComponent({ periodIndex, jamIndex, team }) {
  const [callReason, setCallReason] = useState(null);


  // TODO: Add lead, lost, starPass, noPivot


  return (
    <div style={{width: "300px"}}>
      <TripComponent team={team} />
      <LeadComponent team={team} />
    </div>
  );
}