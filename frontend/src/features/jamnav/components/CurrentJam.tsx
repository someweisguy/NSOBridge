import { ReactElement } from "react";
import { JamId } from "../../../hooks/jam";

export default function CurrentJam({
  jamId
}: {
  jamId: JamId;
}): ReactElement {
  const [periodIndex, jamIndex] = jamId;

  return (
    <div className="size-full place-items-center">
      <div className="p-1 px-2 mx-4 font-semibold text-center bg-gray-200 rounded-full h-fit">
        P{periodIndex + 1} J{jamIndex + 1}
      </div>
    </div>
  );
}
