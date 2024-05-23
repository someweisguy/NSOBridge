import { act, useEffect, useState } from "react";
import { socket, getTick } from "../App";


function TripComponent({ team, periodIndex, jamIndex, trips, setTrips }) {
  const [activeTrip, setActiveTrip] = useState(trips.length);

  async function setPoints(points, tripIndex) {
    const tick = getTick();
    let response = null;
    if (activeTrip == trips.length) {
      response = await socket.emitWithAck("addTrip", team, points, tick);
    } else {
      // Initial trip should always be worth zero points
      response = await socket.emitWithAck("addTrip", team, points, tick);
    }
    if (response != null && response.error == null) {
      let newTrips = [...trips];
      newTrips.push(points);
      setTrips(newTrips);
      setActiveTrip(activeTrip + 1);
    }
  }

  // Render the points buttons
  const pointButtons = [];
  // TODO: render NP/NP and Initial Pass buttons
  for (let i = 0; i <= 4; i++) {
    pointButtons.push(
      <button key={i} onClick={() => setPoints(i, activeTrip)}>
        {i}
      </button>
    );
  }

  // Render each trip as a button
  const tripViewButtons = [];
  for (let i = 0; i <= trips.length; i++) {
    tripViewButtons.push(
      <button key={i} id={i == activeTrip ? "active" : null} onClick={() => setActiveTrip(i) }>
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