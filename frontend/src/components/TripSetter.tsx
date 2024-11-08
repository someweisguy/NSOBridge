import { ReactNode } from "react";
import useJam, { JamId, JamType, TeamType } from "../hooks/jam";

function TripSquare({
  tripIndex,
  points = null,
}: {
  tripIndex: number | string;
  points?: number | null;
}) {
  return (
    <button className="flex-none w-[50px] h-[50px] justify-center align-middle">
      <p className="justify-center text-center bg-white">
        <i>Trip {Number(tripIndex) + 1}</i>
        <br />
        {points == null ? <>&nbsp;</> : points}
      </p>
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
  const jam: JamType = useJam(boutId, jamId);
  const teamJam: TeamType = team == "home" ? jam.home : jam.away;

  const buttonRow: ReactNode =
    teamJam.trips.length == 1 && useInitial ? (
      <div className="flex flex-row justify-center flex-1 max-w-lg px-2 space-x-12">
        <button className="flex-none bg-slate-200">NP/NP</button>
        <button className="flex-none bg-slate-200">Initial</button>
      </div>
    ) : (
      <div className="flex flex-row justify-between flex-1 max-w-lg px-8 space-x-8">
        <button className="flex-none bg-slate-200">0</button>
        <button className="flex-none bg-slate-200">1</button>
        <button className="flex-none bg-slate-200">2</button>
        <button className="flex-none bg-slate-200">3</button>
        <button className="flex-none bg-slate-200">4</button>
      </div>
    );

  const tripCarousel: ReactNode[] = [];
  for (const i in teamJam.trips) {
    tripCarousel.push(
      <TripSquare tripIndex={i} points={teamJam.trips[i].points} />
    );
  }
  tripCarousel.push(<TripSquare tripIndex={tripCarousel.length} />);

  return (
    <span className="flex flex-col justify-center p-4 bg-green-400">
      {buttonRow}
      <div className="flex flex-row min-w-[250px] w-[400px]">
        {tripCarousel}
      </div>
    </span>
  );
}
