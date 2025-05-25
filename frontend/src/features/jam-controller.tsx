import { BoutIdContext } from "@/app/provider";
import GameTimer from "@/components/game-timer";
import { PropsWithChildren, useContext } from "react";

interface JamControllerProps extends PropsWithChildren {
  boutId?: string;
}

export default function JamController({
  boutId,
  children,
}: JamControllerProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  return (
    <div className="justify-items-center grid grid-flow-row w-2/3">
      <div className="place-items-start grid grid-flow-col m-2 w-full align-middle">
        <GameTimer boutId={boutId} />
      </div>
      <div className="justify-center grid grid-flow-col">
        {children}
      </div>
    </div>
  );
}
