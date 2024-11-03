import { useContext } from "react";
import { BoutContext } from "../App";
import useBout, { Bout } from "../hooks/bout";

export default function ScoreboardOperator() {
  const boutId: string = useContext(BoutContext);
  const bout: Bout = useBout(boutId);

  return (
    <>
      <div className="bg-blue-500"></div>
      <p>{JSON.stringify(bout.jams)}</p>
    </>
  );
}
