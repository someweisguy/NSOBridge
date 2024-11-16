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
      carousel.current.scrollLeft = width * selectedTrip;
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

  // Create the buttons which allow the user to add Trips
  const pointButtons: ReactNode[] = [];
  const buttonEntries =
    teamScore.trips.length == 0 && useInitial
      ? { "NP/NP": 0, Initial: 0 }
      : { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4 };
  for (const [text, points] of Object.entries(buttonEntries)) {
    pointButtons.push(
      <button
        onClick={() => addTripCallback(points)}
        className="flex-none bg-slate-200"
      >
        {text}
      </button>
    );
  }

  // Create the buttons which represents the Jammer Trips so far
  const tripButtons: ReactNode[] = [];
  for (let i = 0; i <= teamScore.trips.length; ++i) {
    const points =
      i < teamScore.trips.length ? teamScore.trips[i].points : <>&nbsp;</>;
    tripButtons.push(
      <button
        aria-selected={i == selectedTrip}
        onClick={() => setSelectedTrip(i)}
        className="aria-selected:bg-red-400 hover:bg-red-700 even: bg-slate-400 odd:bg-inherit text-center flex-none w-[50px] h-[50px] justify-center align-middle"
      >
        <i>Trip {i + 1}</i>
        <br />
        {points}
      </button>
    );
  }

  return (
    <span className="flex flex-col justify-center max-w-[350px] flex-1 p-4 bg-green-400">
      <div className="flex flex-row justify-center flex-1 max-w-lg px-4 pb-4 space-x-8 align-middle place-content-between">
        {pointButtons}
      </div>
      <div className="flex flex-row flex-auto overflow-hidden rounded-2xl bg-white">
        <button
          onClick={() => scrollCarousel(-1)}
          className="h-full text-center w-7"
        >
          &lt;
        </button>
        <div
          ref={carousel}
          className="scroll-smooth flex flex-auto flex-row min-w-[100px] w-[150px] max-w-full overflow-x-scroll no-scrollbar bg-slate-100"
        >
          {tripButtons}
        </div>
        <button
          onClick={() => scrollCarousel(1)}
          className="h-full text-center align-middle w-7"
        >
          &gt;
        </button>
      </div>
    </span>
  );
}
