import Button from "@/components/button";
import useJam from "@/hooks/use-jam";
import { addTrip, editTrip, TeamString } from "@/lib/client/api/jam";
import { useCallback } from "react";

interface PointButtonsProps {
  boutId: string;
  periodNum: number;
  jamNum: number;
  tripNum: number;
  team: TeamString;
  showInitial?: boolean;
}

export default function PointButtons({
  boutId,
  periodNum,
  jamNum,
  tripNum,
  team,
  showInitial = false,
}: PointButtonsProps) {
  const numTrips: number = useJam(boutId, periodNum, jamNum)[team].score.trips
    .length;
  const addTripCallback = useCallback(
    (points: number) => {
      if (tripNum > numTrips || tripNum < 0) {
        throw new Error("Trip num out of bounds error");
      } else if (tripNum === numTrips) {
        void addTrip(boutId, periodNum, jamNum, team, points);
      } else {
        void editTrip(boutId, periodNum, jamNum, team, tripNum, points);
      }
    },
    [boutId, periodNum, jamNum, tripNum, team, numTrips]
  );

  return (
    <div className="flex flex-row justify-evenly w-full my-2">
      {!showInitial ? (
        Array.from({ length: 5 }, (_, i) => (
          <Button key={i} onClick={() => addTripCallback(i)}>
            {i}
          </Button>
        ))
      ) : (
        <>
          <Button
            onClick={() =>
              void addTrip(boutId, periodNum, jamNum, team, 0, false)
            }
          >
            No Pass
          </Button>
          <Button
            onClick={() => void addTrip(boutId, periodNum, jamNum, team, 0)}
          >
            Initial
          </Button>
        </>
      )}
    </div>
  );
}
