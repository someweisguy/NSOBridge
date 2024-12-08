import { ReactElement, useContext } from "react";
import { ClockType } from "../types/ClockType";
import useClock from "../hooks/useClock";
import { BoutIdType } from "../types/BoutIdType";
import { BoutIdContext } from "../contexts/BoutIdContext";
import { DurationType } from "../types/DurationType";
import toDuration from "../utils/toDuration";

export default function Clock({ type }: { type: string }): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const clock: ClockType = useClock(boutId, type);
  const showMillis: boolean =
    clock.alarm != null && clock.alarm - clock.elapsed < 10000;
  const duration: DurationType = toDuration(
    clock.alarm != null ? clock.alarm - clock.elapsed : clock.elapsed
  );

  const hourString: string = duration.hours.toString();
  const minuteString: string = duration.minutes.toString().padStart(2, "0");
  const secondString: string = duration.seconds.toString().padStart(2, "0");
  const millisString: string = Math.floor(duration.milliseconds / 100).toString();  // FIXME

  return (
    <>
      {duration.hours > 0 && hourString + ":"}
      {duration.minutes > 0 && minuteString + ":"}
      {secondString}
      {showMillis && "." + millisString}
    </>
  );
}
