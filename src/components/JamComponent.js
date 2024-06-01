import { useEffect, useState, useRef, useReducer } from "react";
import { addRequestHandler, handleRequest, removeRequestHandler, sendRequest } from "../App";
import "./JamComponent.css"


function TripComponent({ team, periodIndex, jamIndex }) {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(0);
  const scrollBar = useRef(null);

  useEffect(() => {
    function setTeamJamHandler(teamJam) {
      if (teamJam.team !== team) {
        return;
      }
      setTrips(teamJam);
    }

    async function fetchData() {  // TODO: make this on connect!
      const response = await sendRequest("jamTrips", "get", { team: team });
      if (!response.error) {
        console.log(response)
        setTrips(response.data.trips);
      }
    }

    fetchData();
    return addRequestHandler("jamTrips", setTeamJamHandler);
  }, []);


  async function setPoints(points) {
    // const tick = getLatency();
    // const response = await socket.emitWithAck("setJamTrip",
    //   { team: team, tripIndex: activeTrip, tripPoints: points, tick: tick });
    // if (response && !response.error) {
    //   updateTrips(response.data);
    // }
  }

  async function deleteTrip() {
    // const tick = getLatency()
    // const response = await socket.emitWithAck("deleteJamTrip",
    //   { team: team, tripIndex: activeTrip, tick: tick });
    // if (response && !response.error) {
    //   let newTrips = trips.filter((_, tripIndex) => tripIndex !== activeTrip);
    //   setTrips(newTrips);
    //   if (activeTrip > 0) {
    //     setActiveTrip(activeTrip - 1);
    //   }
    // }
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