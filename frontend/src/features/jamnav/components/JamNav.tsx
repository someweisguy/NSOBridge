import { ReactElement } from "react";
import JamTraverse from "./JamTraverse";
import CurrentJam from "./CurrentJam";

export default function JamNav(): ReactElement {
  return (
    <div className="flex w-full items-center p-4 max-w-[400px]">
      <JamTraverse>Back</JamTraverse>
      <CurrentJam periodIndex={0} jamIndex={2} />
      <JamTraverse>Next</JamTraverse>
    </div>
  );
}
