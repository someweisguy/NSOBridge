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
    // const name = i == activeTrip ? "active" : "";
    tripViewButtons.push(
      <button key={i} onClick={() => setActiveTrip(i)}>
        <small>Trip {i + 1}</small>
        <br />{i < trips.length ? trips[i] : "\u00A0"}
      </button>
    );
  }
  tripViewButtons[activeTrip].props.className = "active";

  return (
    <div>
      {pointButtons}
      <br />
      <div className="tripView">
        {tripViewButtons}
      </div>
    </div>
  );
}


export function JamComponent({ periodIndex, jamIndex }) {
  // const [callReason, setCallReason] = useState(null);


  // TODO: Add lead, lost, starPass, noPivot

  // useEffect(async () => {
  //   function updateJam(payload) {
  //     console.log(payload);
  //     const data = payload.data;
  //     setCallReason(data.callReason);
  //     setHomeTrips(data.home.trips.map((trips) => trips.points));
  //     setAwayTrips(data.away.trips.map((trips) => trips.points));
  //   }
  //   socket.on("jamUpdate", (payload) => { updateJam(payload); });
  //   const jamState = await socket.emitWithAck("getCurrentJam");
  //   updateJam(jamState);

  //   return () => { socket.removeListener("jamUpdate"); };
  // }, []);




  return (
    <div>
      <TripComponent team="home" />
      {/* <TripComponent team="away" trips={awayTrips} setTrips={setAwayTrips} /> */}
    </div>
  );
}