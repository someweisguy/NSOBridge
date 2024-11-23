import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
} from "react";
import { JamId } from "../hooks/jam";
import useScore, { deleteTrip, ScoreType, setTrip } from "../hooks/score";

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
  const [selectedTrip, setSelectedTrip] = useState<number>(
    teamScore.trips.length
  );

  const addTripCallback = useCallback(
    (points: number) => {
      setTrip(boutId, jamId, team, selectedTrip, points);
      if (selectedTrip == teamScore.trips.length) {
        setSelectedTrip(selectedTrip + 1);
      }
    },
    [boutId, jamId, team, teamScore, selectedTrip]
  );

  const deleteTripCallback = useCallback(
    (tripId: number) => {
      deleteTrip(boutId, jamId, team, tripId);
    },
    [boutId, jamId, team]
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
        className="flex-none rounded-md w-14 h-7 last:scale-125 bg-slate-200"
      >
        {text}
      </button>
    );
  }

  // Create the buttons which represents the Jammer Trips so far
  const tripButtons: ReactNode[] = [];
  for (let i = 0; i <= teamScore.trips.length; ++i) {
    const points: number | undefined =
      i < teamScore.trips.length ? teamScore.trips[i].points : undefined;
    const timestamp: string | undefined =
      i < teamScore.trips.length ? teamScore.trips[i].timestamp : undefined;
    const isSelected = i == selectedTrip;
    tripButtons.push(
      <TripButton
        tripIndex={i}
        points={points}
        selected={isSelected}
        timestamp={timestamp}
        selectTrip={() => setSelectedTrip(i)}
        deletable={i > 0 && i != teamScore.trips.length && isSelected}
        deleteTrip={() => deleteTripCallback(i)}
      />
    );
  }

  return (
    <span className="flex flex-col justify-center max-w-[350px] flex-1 p-4 bg-green-400">
      <div className="flex flex-row content-between justify-center flex-1 max-w-lg pb-4 space-x-2">
        {pointButtons}
      </div>
      <TripCarousel selectedTrip={selectedTrip}>{tripButtons}</TripCarousel>
    </span>
  );
}

function TripCarousel({
  selectedTrip,
  children,
}: PropsWithChildren<{ selectedTrip: number }>) {
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      const width = carousel.current.children[0].getBoundingClientRect().width;
      const divWidth: number = carousel.current.getBoundingClientRect().width;

      // Only scroll if outside of a desired "dead-zone"
      const newScroll: number = width * selectedTrip - (divWidth - width) / 2;
      if (
        selectedTrip == Children.count(children) ||
        Math.abs(carousel.current.scrollLeft - newScroll) > 75
      ) {
        carousel.current.scrollLeft = newScroll;
      }
    }
  }, [children, selectedTrip]);

  const scrollCarousel = useCallback((amount: number) => {
    if (carousel.current) {
      const width = carousel.current.children[0].getBoundingClientRect().width;
      carousel.current.scrollLeft += width * amount;
    }
  }, []);

  return (
    <div className="relative flex items-center w-full h-24 grid-flow-col p-2 px-16 bg-slate-200">
      <div className="z-10 text-center translate-x-1/2 size-10">
        <button
          onClick={() => scrollCarousel(-1)}
          className="text-xl font-bold leading-loose transition duration-300 rounded-full shadow-md size-full bg-amber-300 text-amber-500 opacity-80 hover:-translate-x-1 hover:opacity-100"
        >
          &#10096;
        </button>
      </div>

      <div
        ref={carousel}
        className="flex flex-row items-start flex-1 w-full py-2 overflow-x-scroll bg-white rounded-md shadow-inner no-scrollbar scroll-smooth size-full gap-x-2 px-7"
      >
        {children}
      </div>

      <div className="z-10 text-center -translate-x-1/2 size-10">
        <button
          onClick={() => scrollCarousel(1)}
          className="text-xl font-bold leading-loose transition duration-300 rounded-full shadow-md size-full bg-amber-300 text-amber-500 opacity-80 hover:translate-x-1 hover:opacity-100"
        >
          &#10097;
        </button>
      </div>

      <div
        aria-hidden={selectedTrip < Children.count(children)}
        className="absolute text-center transition duration-500 right-6 size-10 -translate-x-1/4 aria-hidden:hidden aria-hidden:-translate-x-full aria-hidden:opacity-0 aria-hidden:duration-0"
      >
        <button className="text-xl font-bold leading-loose transition rounded-full shadow-md size-full bg-amber-300 text-amber-500 opacity-80 hover:translate-x-1 hover:opacity-100">
          &#10097;&#10097;
        </button>
      </div>
    </div>
  );
}

function TripButton({
  tripIndex,
  points,
  timestamp,
  selected,
  deletable,
  selectTrip,
  deleteTrip,
}: {
  tripIndex: number;
  points?: number;
  timestamp?: string;
  selected: boolean;
  deletable: boolean;
  selectTrip?: () => void;
  deleteTrip?: () => void;
}) {
  return (
    <div
      id={timestamp}
      aria-selected={selected}
      data-deletable={deletable}
      className="group w-14 flex-none place-content-center transition data-[deletable=true]:hover:-translate-y-10 delay-700"
    >
      <div className="relative aspect-[14/16] h-16 rounded-md outline outline-1 outline-slate-400 hover:scale-105 hover:shadow-lg group-odd:bg-slate-50 group-even:bg-slate-100 group-aria-selected:bg-amber-100 group-aria-selected:outline-amber-400">
        <button onClick={selectTrip} className="size-full">
          Trip {tripIndex + 1}
          <br />
          {points != null ? points : <>&nbsp;</>}
        </button>
      </div>
      <div className="h-20 pt-3 text-center w-14">
        <button
          onClick={deleteTrip}
          className="text-center text-red-100 bg-red-400 rounded-full shadow-md aspect-square size-7 hover:scale-95 hover:shadow-sm"
        >
          X
        </button>
      </div>
    </div>
  );
}
