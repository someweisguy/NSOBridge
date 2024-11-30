import { ReactElement } from "react";
import NavButton from "./NavButton";
import { JamId } from "../../../hooks/jam";
import TripCard from "./TripCard";
import useScore from "../hooks/useScore";

export default function TripCarousel({
  className = "rounded-lg bg-slate-300",
  boutId,
  jamId,
  team,
  tripState,
}: {
  className?: string;
  boutId: string;
  jamId: JamId;
  team: "home" | "away";
  tripState: [number, React.Dispatch<React.SetStateAction<number>>];
}): ReactElement {
  const teamScore = useScore(boutId, jamId, team);
  const [selectedTrip, setSelectedTrip] = tripState;

  

  const trips: ReactElement[] = [];
  for (let i = 0; i <= teamScore.trips.length; i++) {
    const points: number = teamScore.trips[i]?.points;
    const selected: boolean = i == selectedTrip;
    const id: string = teamScore.trips[i]?.timestamp;
    trips.push(
      <TripCard
        tripIndex={i}
        points={points}
        selected={selected}
        onClick={() => setSelectedTrip(i)}
        id={id}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-row items-center flex-initial h-24 min-w-full p-2 px-12">
        <div className="z-20 translate-x-1/2">
          <NavButton direction="left" />
        </div>
        <div className="flex flex-row gap-2 p-2 px-5 overflow-x-scroll overflow-y-hidden bg-white rounded-md shadow-inner grow-0 size-full w-72 no-scrollbar">
          {trips}
        </div>
        <div className="z-20 -translate-x-1/2">
          <NavButton direction="right" />
        </div>
        {/* TODO: add scroll to end button */}
      </div>
    </div>
  );
}
