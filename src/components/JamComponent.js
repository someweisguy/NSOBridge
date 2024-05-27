import { useEffect, useState, useRef } from "react";
import { socket, getTick } from "../App";
import "./JamComponent.css"


function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(0);
  const scrollBar = useRef(null);


  useEffect(async () => {
    const apiCall = "getJamTrip";
    socket.on(apiCall, (payload) => { updateTrips(payload.data); });
    const response = await socket.emitWithAck(apiCall, { team: team });
    if (response && !response.error) {
      updateTrips(response.data);
    }


    return () => { socket.removeListener(apiCall); };
  }, []);

  function updateTrips(data) {
    if (data.team !== team) {
      return;
    }
    let newTrips = data.trips.map((trip) => trip.points);
    if (activeTrip === trips.length) {
      setActiveTrip(newTrips.length);
    }
    setTrips(newTrips)
  }

  async function setPoints(points) {
    const tick = getTick();
    const response = await socket.emitWithAck("setJamTrip",
      { team: team, tripIndex: activeTrip, tripPoints: points, tick: tick });
    if (response && !response.error) {
      updateTrips(response.data);
    }
  }

  async function deleteTrip() {
    const tick = getTick()
    const response = await socket.emitWithAck("deleteJamTrip",
      { team: team, tripIndex: activeTrip, tick: tick });
    if (response && !response.error) {
      let newTrips = trips.filter((_, tripIndex) => tripIndex !== activeTrip);
      setTrips(newTrips);
      if (activeTrip > 0) {
        setActiveTrip(activeTrip - 1);
      }
    }
  }

  function scroll(amount) {
    scrollBar.current.scrollLeft += amount;
  }

  // Render the points buttons
  const pointButtons = [];
  if (activeTrip === 0) {
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
      const disabled = i === disableIndex;
      pointButtons.push(
        <button key={i} className={className} disabled={disabled}
          onClick={() => setPoints(i)}>
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
  if (activeTrip < trips.length && (activeTrip > 0 || trips.length === 1)) {
    visibility = "visible";
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
        <button onClick={() => scroll(-50)}>&lt;</button>
        <div ref={scrollBar} className="trips">
          {tripViewButtons}
        </div>
        <button onClick={() => scroll(50)}>&gt;</button>
      </div>

    </div>
  );
}

function LeadComponent({ periodIndex, jamIndex, team }) {

  return (
    <div style={{ border: "1px solid black" }}>
      Hello world!
    </div>
  );
}


export function TeamJamComponent({ periodIndex, jamIndex, team }) {
  // const [callReason, setCallReason] = useState(null); // TODO


  // TODO: Add lead, lost, starPass, noPivot


  return (
    <div style={{ width: "400px" }}>
      <TripComponent team={team} />
      <LeadComponent team={team} />
    </div>
  );
}