import { ReactElement, useContext } from "react";
import { ClockType } from "../../../types/ClockType";
import useDynamicClock from "../hooks/useDynamicClock";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";

export default function Clock({
  type,
  showLeadingZero = false,
  millisStyle = "auto",
}: {
  type: string;
  showLeadingZero?: boolean;
  millisStyle?: "never" | "always" | "auto";
}): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const clock: ClockType = useDynamicClock(boutId, type);

  // Calculate the time remaining
  let totalMillseconds: number =
    clock.alarm != null ? clock.alarm - clock.elapsed : clock.elapsed;
  if (totalMillseconds < 0) {
    totalMillseconds = 0;
  }

  // Calculate the hours, minutes, seconds
  const seconds: number = Math.floor(totalMillseconds / 1000) % 60;
  const minutes: number = Math.floor(totalMillseconds / 60000) % 60;
  const hours: number = Math.floor(totalMillseconds / 3600000);

  // Format the time string
  let timeString: string = "";
  for (const unit of [hours, minutes]) {
    if (unit === 0 && timeString === "") {
      continue;
    } else if (showLeadingZero || timeString !== "") {
      timeString += unit.toString().padStart(2, "0");
    } else {
      timeString += unit;
    }
    timeString += ":";
  }
  if (showLeadingZero || timeString !== "") {
    timeString += seconds.toString().padStart(2, "0");
  } else {
    timeString += seconds;
  }

  // Add milliseconds if necessary
  const showMillis: boolean =
    millisStyle === "always" ||
    (millisStyle === "auto" && clock.alarm != null && totalMillseconds < 10000);
  if (showMillis) {
    const millis: number = Math.floor((totalMillseconds % 1000) / 100);
    timeString += "." + millis;
  }

  return <>{timeString}</>;
}
