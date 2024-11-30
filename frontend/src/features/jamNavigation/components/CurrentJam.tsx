import { ReactElement } from "react";
import { JamIdType } from "../../../types/JamIdType";


export default function CurrentJam({
  jamId
}: {
  jamId: JamIdType;
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
