import { act, useEffect, useState } from "react";
import { socket, getTick } from "../App";


function TripComponent({ team, periodIndex, jamIndex, trips, setTrips }) {
  const [activeTrip, setActiveTrip] = useState(trips.length);

  async function setPoints(points) {
    const tick = getTick();
    let response = await socket.emitWithAck("setTrip", team, activeTrip, points, tick);
    if (response != null && response.error == null) {
      let newTrips = [...trips];
      if (activeTrip == trips.length) {
        newTrips.push(points);
        setActiveTrip(activeTrip + 1);
      } else {
        newTrips[activeTrip] = points;
      }
      setTrips(newTrips);
    }
  }

  // Render the points buttons
  const pointButtons = [];
  if (activeTrip == 0) {
    // Render No-Pass/No-Penalty and Initial Pass buttons
    pointButtons.push(
      <button key={0} onClick={() => setPoints(0)}>
        NP/NP
      </button>
    );
    pointButtons.push(
      <button key={1} onClick={() => setPoints(0)}>
        Initial
      </button>
    );
  } else {
    // Render trip point buttons
    for (let i = 0; i <= 4; i++) {
      pointButtons.push(
        <button key={i} onClick={() => setPoints(i)}>
          {i}
        </button>
      );
    }
  }


  // Render each trip as a button
  const tripViewButtons = [];
  for (let i = 0; i <= trips.length; i++) {
    const id = i == activeTrip ? "active" : "";
    tripViewButtons.push(
      <button key={i} id={id} onClick={() => setActiveTrip(i)}>
        <small>Trip {i + 1}</small>
        <br />{i < trips.length ? trips[i] : "\u00A0"}
      </button>
    );
  }

  return (
    <span>
      {pointButtons}<br />
      {tripViewButtons}
    </span>
  );
}


export function JamComponent({ periodIndex, jamIndex }) {
  const [callReason, setCallReason] = useState(null);

  const [homeTrips, setHomeTrips] = useState([]);
  const [awayTrips, setAwayTrips] = useState([]);

  // TODO: Add lead, lost, starPass, noPivot

  useEffect(async () => {
    function updateJam(payload) {
      console.log(payload);
      const data = payload.data;
      setCallReason(data.callReason);
      setHomeTrips(data.home.trips.map((trips) => trips.points));
      setAwayTrips(data.away.trips.map((trips) => trips.points));
    }
    socket.on("jamUpdate", (payload) => { updateJam(payload); });
    const jamState = await socket.emitWithAck("getCurrentJam");
    updateJam(jamState);

    return () => { socket.removeListener("jamUpdate"); };
  }, []);




  return (
    <div>
      <TripComponent team="home" trips={homeTrips} setTrips={setHomeTrips} />
      {/* <TripComponent team="away" trips={awayTrips} setTrips={setAwayTrips} /> */}
    </div>
  );
}