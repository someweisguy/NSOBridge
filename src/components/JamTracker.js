import { useEffect, useState } from "react";
import { socket } from "../App";

export function JamTracker({ team }) {
  const [trips, setTrips] = useState([]);
  useEffect(() => {
    socket.on("jamUpdate", (payload) => {
      console.log(payload.data[team].trips);
      let newTrips = payload.data[team].trips.map((tripData) => tripData.points);
      setTrips(newTrips);
    });
  }, []);


  function handleClick() {
    socket.emitWithAck("addTrip", team, 0, 0);
    let newTrips = [...trips];
    newTrips.push(0);
    console.log(newTrips);

    setTrips(newTrips);
  }

  // Render each trip as a button
  let tripButtons = trips.map((trip, i) =>
    <button>
      <small>Trip {i + 1}</small>
      <br />{trip}
    </button>
  );

  return (
    <div>
      <div><button onClick={handleClick}>Click me!</button></div><br />
      <div>{tripButtons}</div>
    </div>
  );
}