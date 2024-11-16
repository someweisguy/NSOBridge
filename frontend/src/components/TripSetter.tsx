import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { JamId } from "../hooks/jam";
import useScore, { ScoreType, setTrip } from "../hooks/score";

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
  const [selectedTrip, setSelectedTrip] = useState(teamScore.trips.length);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      const { width } = carousel.current.children[0].getBoundingClientRect();
      carousel.current.scrollLeft = width * (selectedTrip - 1);
    }
  }, [selectedTrip]);

  const scrollCarousel = useCallback((amount: number) => {
    if (carousel.current) {
      const { width } = carousel.current.children[0].getBoundingClientRect();
      carousel.current.scrollLeft += width * amount;
    }
  }, []);

  const addTripCallback = useCallback(
    (points: number) => {
      setTrip(boutId, jamId, team, selectedTrip, points);
      if (selectedTrip == teamScore.trips.length) {
        setSelectedTrip(selectedTrip + 1);
      }
    },
    [boutId, jamId, team, teamScore, selectedTrip]
  );

  const buttonRow: ReactNode =
    teamScore.trips.length == 0 && useInitial ? (
      <div className="flex flex-row justify-center flex-1 max-w-lg pb-4 space-x-12">
        <button
          onClick={() => addTripCallback(0)}
          className="flex-none bg-slate-200"
        >
          NP/NP
        </button>
        <button
          onClick={() => addTripCallback(0)}
          className="flex-none bg-slate-200"
        >
          Initial
        </button>
      </div>
    ) : (
      <div className="flex flex-row justify-between flex-1 max-w-lg px-8 pb-4 space-x-8">
        <button
          onClick={() => addTripCallback(0)}
          className="flex-none bg-slate-200"
        >
          0
        </button>
        <button
          onClick={() => addTripCallback(1)}
          className="flex-none bg-slate-200"
        >
          1
        </button>
        <button
          onClick={() => addTripCallback(2)}
          className="flex-none bg-slate-200"
        >
          2
        </button>
        <button
          onClick={() => addTripCallback(3)}
          className="flex-none bg-slate-200"
        >
          3
        </button>
        <button
          onClick={() => addTripCallback(4)}
          className="flex-none bg-slate-200"
        >
          4
        </button>
      </div>
    );

  const tripCarousel: ReactNode[] = [];
  for (const i in teamScore.trips) {
    tripCarousel.push(
      <TripSquare
        tripIndex={i}
        points={teamScore.trips[i].points}
        tripState={[selectedTrip, setSelectedTrip]}
      />
    );
  }
  tripCarousel.push(
    <TripSquare
      tripIndex={tripCarousel.length}
      tripState={[selectedTrip, setSelectedTrip]}
    />
  );

  return (
    <span className="flex flex-col justify-center max-w-[350px] flex-1 p-4 bg-green-400">
      {buttonRow}
      <div className="flex flex-row flex-auto overflow-hidden rounded-2xl">
        <button
          onClick={() => scrollCarousel(-1)}
          className="h-full text-center bg-white w-7"
        >
          &lt;
        </button>
        <div
          ref={carousel}
          className="scroll-smooth flex flex-auto flex-row min-w-[100px] w-[150px] max-w-full overflow-x-scroll no-scrollbar bg-slate-100"
        >
          {tripCarousel}
        </div>
        <button
          onClick={() => scrollCarousel(1)}
          className="h-full text-center align-middle bg-white w-7"
        >
          &gt;
        </button>
      </div>
    </span>
  );
}

function TripSquare({
  tripIndex,
  points = null,
  tripState,
}: {
  tripIndex: number | string;
  points?: number | null;
  tripState: [number, (trip: number) => void];
}) {
  const [selectedTrip, setSelectedTrip] = tripState;
  tripIndex = Number(tripIndex);

  const button: ReactNode = (
    <button
      className="aria-selected:bg-red-400 hover:bg-red-700 even: bg-slate-400 odd:bg-inherit text-center flex-none w-[50px] h-[50px] justify-center align-middle"
      aria-selected={tripIndex == selectedTrip}
      onClick={() => setSelectedTrip(tripIndex)}
    >
      <i>Trip {tripIndex + 1}</i>
      <br />
      {points == null ? <>&nbsp;</> : points}
    </button>
  );
  return button;
}
