import Button from "@/components/button";
import useJam from "@/hooks/use-jam";
import { addTrip, editTrip } from "@/lib/client/api/jam";
import { useCallback } from "react";

interface PointButtonsProps {
  boutId: string;
  periodNum: number;
  jamNum: number;
  tripNum: number;
  team: number;
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
  const numTrips: number = useJam(boutId, periodNum, jamNum).teamJams[team]
    .trips.length;
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
    <div className="flex flex-row justify-evenly my-2 w-full">
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
              void addTrip(boutId, periodNum, jamNum, team, 0)
            }
          >
            No Pass
          </Button>
          <Button
            onClick={() => void addTrip(boutId, periodNum, jamNum, team, 4)}
          >
            Initial
          </Button>
        </>
      )}
    </div>
  );
}
