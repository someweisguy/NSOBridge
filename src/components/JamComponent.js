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


function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, selectTrip] = useState(0);
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

  }, [team, selectedTrip, trips]);
  useInterface("jamTrips", tripsHandler, { team: team });

  useEffect(() => {
    // Scroll the Trips scrollbar to the selected Trip.
    const selectedTripButton = scrollBar.current.children[selectedTrip];
    selectedTripButton.scrollIntoView({ inline: "center" });
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
      disableIndex = trips[selectedTrip].point;
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

    </div>
  );
}

function LeadComponent({ periodIndex, jamIndex, team }) {
  const [lead, setLead] = useState(false);
  const [lost, setLost] = useState(false);
  const [starPass, setStarPass] = useState(null);

  function updateLead(data) {
    console.log(data);
    if (data.team !== team) {
      return;
    }
    setLead(data.lead);
    setLost(data.lost);
    setStarPass(data.starPass);
  }

  useEffect(async () => {
    // const apiCall = "getJamTrip";
    // socket.on(apiCall, (payload) => { updateLead(payload.data); });
    // const response = await socket.emitWithAck(apiCall, { team: team });
    // if (response && !response.error) {
    //   updateLead(response.data);
    // }

    // return () => { socket.removeListener(apiCall); };
  }, []);

  useEffect(() => {
    // const tick = getLatency();
    // async function setApi(apiName, data) {
    //   data.tick = getLatency();
    //   return await socket.emitWithAck(apiName, data);
    // }

    // const response = setApi("setJamLead", { team: team, lead: lead, lost: lost, starPass: starPass });
    // if (response && response.error) {
    //   setLead(response.data.lead);
    //   setLost(response.data.lost);
    //   setStarPass(response.data.starPass);
    // }

  }, [lead, lost, starPass])

  async function doLead() {
    // const tick = getLatency();
    // // setLead(!lead);
    // const response = await socket.emitWithAck("setJamLead",
    //   { team: team, lead: !lead, lost: lost, starPass: starPass, tick: tick});
    // if (response && !response.error) {
    //   updateLead(response);
    // }
  }

  return (
    <div>
      <div>
        Lead Jammer <input type="checkbox" checked={lead} onChange={() => setLead(!lead)}></input>
      </div>
      <div>
        Lost Lead <input type="checkbox" checked={lost} onChange={() => setLost(!lost)}></input>
      </div>
      <div>
        Star Pass <input type="checkbox" checked={starPass} onChange={() => setStarPass(!starPass)}></input>
      </div>

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