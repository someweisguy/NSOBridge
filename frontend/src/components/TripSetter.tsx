import { ReactNode, useCallback } from "react";
import { JamId } from "../hooks/jam";
import useScore, { ScoreType, addTrip } from "../hooks/score";

function TripSquare({
  tripIndex,
  points = null,
}: {
  tripIndex: number | string;
  points?: number | null;
}) {
  return (
    <button className="bg-white text-center flex-none w-[50px] h-[50px] justify-center align-middle">
      <i>Trip {Number(tripIndex) + 1}</i>
      <br />
      {points == null ? <>&nbsp;</> : points}
    </button>
  );
}

export default function TripSetter({
  boutId,
  jamId,
  team,
  useInitial = true,
}: {
  boutId: string;
  jamId: JamId;
  team: string;
  useInitial?: boolean;
}) {
  const teamScore: ScoreType = useScore(boutId, jamId, team);

  const addTripCallback = useCallback((points: number) => {
    addTrip(boutId, jamId, team, points);
  }, [boutId, jamId, team])

  const buttonRow: ReactNode =
    teamScore.trips.length == 1 && useInitial ? (
      <div className="flex flex-row justify-center flex-1 max-w-lg pb-4 space-x-12">
        <button onClick={() => addTripCallback(0)} className="flex-none bg-slate-200">NP/NP</button>
        <button onClick={() => addTripCallback(0)} className="flex-none bg-slate-200">Initial</button>
      </div>
    ) : (
      <div className="flex flex-row justify-between flex-1 max-w-lg px-8 pb-4 space-x-8">
        <button onClick={() => addTripCallback(0)} className="flex-none bg-slate-200">0</button>
        <button onClick={() => addTripCallback(1)} className="flex-none bg-slate-200">1</button>
        <button onClick={() => addTripCallback(2)} className="flex-none bg-slate-200">2</button>
        <button onClick={() => addTripCallback(3)} className="flex-none bg-slate-200">3</button>
        <button onClick={() => addTripCallback(4)} className="flex-none bg-slate-200">4</button>
      </div>
    );

  const tripCarousel: ReactNode[] = [];
  for (const i in teamScore.trips) {
    tripCarousel.push(
      <TripSquare tripIndex={i} points={teamScore.trips[i].points} />
    );
  }
  tripCarousel.push(<TripSquare tripIndex={tripCarousel.length} />);

  return (
    <span className="flex flex-col justify-center p-4 bg-green-400">
      {buttonRow}
      <div className="flex flex-row overflow-hidden rounded-2xl">
        <button className="h-full text-center bg-white w-7">&lt;</button>
        <div className="flex flex-auto flex-row min-w-[200px] w-[350px] overflow-x-scroll no-scrollbar bg-red-500">
          {tripCarousel}
        </div>
        <button className="h-full text-center align-middle bg-white w-7">
          &gt;
        </button>
      </div>
    </span>
  );
}
