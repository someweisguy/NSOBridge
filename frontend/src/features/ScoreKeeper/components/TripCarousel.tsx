import { ReactElement, useCallback, useEffect, useRef } from "react";
import TripNavigationButton from "./TripNavigationButton";
import TripCard from "./TripCard";
import useScore from "../../../hooks/useScore";
import DeleteReveal from "./DeleteReveal";
import deleteTrip from "../api/deleteTrip";
import { JamIdType } from "../../../types/JamIdType";

export default function TripCarousel({
  className = "",
  boutId,
  jamId,
  team,
  tripState,
}: {
  className?: string;
  boutId: string;
  jamId: JamIdType;
  team: "home" | "away";
  tripState: [number, React.Dispatch<React.SetStateAction<number>>];
}): ReactElement {
  const teamScore = useScore(boutId, jamId, team);
  const [selectedTrip, setSelectedTrip] = tripState;
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      let currentSelectedTrip: number = selectedTrip;
      if (selectedTrip >= carousel.children.length) {
        currentSelectedTrip = carousel.children.length - 1;
        setSelectedTrip(currentSelectedTrip);
      }
      carousel.children[currentSelectedTrip].scrollIntoView({
        inline: "center",
      });
    }
  }, [selectedTrip, setSelectedTrip, teamScore.trips.length]);

  const removeTrip = useCallback(
    (tripIndex: number) => {
      return deleteTrip(boutId, jamId, team, tripIndex);
    },
    [boutId, jamId, team]
  );

  const trips: ReactElement[] = [];
  for (let i = 0; i <= teamScore.trips.length; i++) {
    const points: number = teamScore.trips[i]?.points;
    const selected: boolean = i == selectedTrip;
    const id: string = teamScore.trips[i]?.timestamp;

    let tripCard: ReactElement = (
      <TripCard
        tripIndex={i}
        points={points}
        selected={selected}
        onClick={() => setSelectedTrip(i)}
        id={id}
      />
    );
    if (
      i == selectedTrip &&
      i < teamScore.trips.length &&
      (i > 0 || teamScore.trips.length == 1)
    ) {
      tripCard = (
        <DeleteReveal onClick={() => removeTrip(i)}>{tripCard}</DeleteReveal>
      );
    }

    trips.push(tripCard);
  }

  return (
    <div className={className}>
      <div className="flex flex-row flex-initial items-center px-12 p-2 min-w-full h-24">
        <div className="z-20 translate-x-1/2">
          <TripNavigationButton direction="left" />
        </div>
        <div
          ref={carouselRef}
          className="flex flex-row gap-2 bg-white shadow-inner px-5 p-2 rounded-md grow-0 w-72 overflow-x-scroll overflow-y-hidden no-scrollbar outline outline-1 outline-gray-300 scroll-smooth size-full"
        >
          {trips}
        </div>
        <div className="z-20 -translate-x-1/2">
          <TripNavigationButton direction="right" />
        </div>
        {/* TODO: add scroll to end button */}
      </div>
    </div>
  );
}
