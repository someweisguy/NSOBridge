import { useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import useBout from "../../../hooks/useBout";

export default function ScoreViewer({ team }: { team: "home" | "away" }) {
  const boutId = useContext<BoutIdType>(BoutIdContext);

  const [teamName, score] = useBout<[string, number]>(boutId, (bout) => {
    return [bout.roster[team], bout.score[team]];
  });

  // Set the default team name if it is not provided
  let teamString: string = teamName!;
  if (teamName === null) {
    if (team === "home") {
      teamString = "Home";
    } else {
      teamString = "Away";
    }
  }

  // TODO: add Jam score
  // TODO: make timeout bar its own component

  return (
    <div className="flex flex-col items-center p-4">
      <div className="p-4 text-4xl">{teamString}</div>

      <div className="grid items-stretch grid-flow-col">
        <div className="items-center bg-blue">
          <div className="grid p-2 mx-4 bg-raisin-200 place-items-center rounded-xl">
            <span className="inline-grid gap-2 pb-2 border-b border-raisin-50">
              <span
                aria-hidden="false"
                className="bg-black rounded-full aspect-square size-3 aria-hidden:invisible"
              ></span>
              <span
                aria-hidden="false"
                className="bg-black rounded-full aspect-square size-3 aria-hidden:invisible"
              ></span>
              <span
                aria-hidden="false"
                className="bg-black rounded-full aspect-square size-3 aria-hidden:invisible"
              ></span>
            </span>
            <span className="inline-grid pt-2">
              <span
                aria-hidden="false"
                className="row-start-5 bg-black rounded-full aspect-square size-3 aria-hidden:invisible"
              ></span>
            </span>
          </div>
        </div>

        <p className="p-2 font-bold text-7xl">{score}</p>

        <p className="content-center p-5 text-4xl font-bold text-left">0</p>
      </div>
    </div>
  );
}
