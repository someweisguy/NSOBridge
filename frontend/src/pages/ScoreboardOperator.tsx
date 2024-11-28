// import { useContext, useState } from "react";
// import { BoutContext } from "../App";
// import { JamId, useJamNavigation } from "../hooks/jam";
// import useBout, { BoutType } from "../hooks/bout";
import TripCarousel from "../features/score/components/TripCarousel";
import TripCard from "../features/score/components/TripCard";
import JamNav from "../features/jamnav/components/JamNav";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  // const boutId: string = useContext(BoutContext);
  // const bout: BoutType = useBout(boutId);

  // Get the latest Jam ID and Jam
  // const [jamId, setJamId] = useState<JamId>(() => {
  //   const periodIndex: number = bout.jams.counts[1] > 0 ? 1 : 0;
  //   const jamIndex: number = bout.jams.counts[periodIndex] - 1;
  //   return [periodIndex, jamIndex]; // TODO: get active Jam, not latest Jam
  // });
  // const [previousJamId, nextJamId] = useJamNavigation(boutId, jamId);
  // const [periodIndex, jamIndex] = jamId;

  return (
    <>
    <div className="flex flex-col items-center">

      <JamNav />
      <div className="flex flex-row gap-4">
        <TripCarousel>
          <TripCard tripIndex={0} points={0} id={"id"} />
          <TripCard tripIndex={1} points={4} id={"id"} />
          <TripCard tripIndex={2} points={4} id={"id"} />
          <TripCard tripIndex={3} points={4} id={"id"} />
          <TripCard tripIndex={4} points={4} id={"id"} />
          <TripCard tripIndex={5} points={4} id={"id"} />
        </TripCarousel>
        <TripCarousel>
          <TripCard tripIndex={0} points={0} id={"id"} />
        </TripCarousel>
      </div>
    </div>
    </>
  );
}
