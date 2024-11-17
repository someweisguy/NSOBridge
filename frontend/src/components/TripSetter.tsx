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
    const isSelected = i == selectedTrip;
    tripButtons.push(
      <TripButton
        selected={isSelected}
        onClick={() => setSelectedTrip(i)}
        tripIndex={i}
        points={points}
        hideDelete={i == teamScore.trips.length || !isSelected}
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
    <span className="flex flex-row w-full overflow-x-scroll no-scrollbar contet-box">
        
        <div className="flex flex-col">
          <button className="flex-initial ">&lt;</button>
       
        </div>

      {/* Button scrollbar */}
        {children}

    </span>

  );

  return (
    <div className="flex flex-row items-start w-full h-full grid-rows-1 mb-10 overflow-x-scroll scroll-smooth no-scrollbar">
      <button
        onClick={() => scrollCarousel(-1)}
        className="flex-none h-full text-center bg-white w-7 rounded-l-2xl"
      >
        &lt;
      </button>
      <div
        ref={carousel}
        className="contents"
      >
        {children}
      </div>
      {/* <button
        onClick={() => scrollCarousel(1)}
        className="right-0 text-center bg-white h-2/3 w-7 rounded-r-2xl"
      >
        &gt;
      </button> */}
    </div>
  );
}

function TripButton({
  selected,
  onClick,
  tripIndex,
  points,
  hideDelete,
}: {
  selected: boolean;
  onClick?: () => void;
  tripIndex: number;
  points?: number;
  hideDelete: boolean;
}) {
  return (
    <button
      aria-expanded={!hideDelete}
      aria-selected={selected}
      onClick={onClick}
      className="h-[50px] min-w-[50px] aria-expanded:mb-[30px] aria-selected:bg-red-400 even:bg-slate-500 odd:bg-white hover:bg-red-700"
    >
      <i>Trip {tripIndex + 1}</i>
      <br />
      {points ? points : <>&nbsp;</>}
      <button
        aria-hidden={hideDelete}
        className="w-full bg-orange-500 rounded-b-2xl h-5/12 -bottom-full aria-hidden:invisible"
      >
        Del
      </button>
    </button>
  );
}

/*





*/
