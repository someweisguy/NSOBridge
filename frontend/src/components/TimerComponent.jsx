import { useEffect, useState } from "react";
import { useClock } from "../customHooks";

export function formatTimeString(millisRemaining, showMillis = true) {
  // FIXME: show negative numbers
  let timeString = "";
  if (millisRemaining > 0) {
    let hours = Math.floor((millisRemaining / (1000 * 60 * 60)) % 24);
    if (hours > 0) {
      // Format the hours string
      timeString += hours + ":";
    }
    let minutes = Math.floor((millisRemaining / (1000 * 60)) % 60);
    if (minutes > 0) {
      // Format the minutes string with an optional leading zero
      if (hours > 0) {
        minutes = minutes < 10 ? "0" + minutes : minutes.toString();
      }
      timeString += minutes + ":";
    }
    // Format the seconds string with an optional leading zero
    let seconds = Math.floor((millisRemaining / 1000) % 60);
    if (millisRemaining >= 10000) {
      seconds = seconds < 10 ? "0" + seconds : seconds.toString();
      timeString += seconds;
    } else if (millisRemaining < 10000) {
      timeString += seconds
      if (showMillis) {
        let deciseconds = Math.floor((millisRemaining % 1000) / 100);
        timeString += "." + deciseconds;
      }
    }
  } else {
    timeString = "0";
    if (showMillis) {
      timeString += ".0";
    }
  }
  return timeString;
}

export default function Clock({ bout, type, placeholder = "0", delay = 1250 }) {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const clock = useClock(bout, type);

  // Show placeholder immediately if clock is elapsed on initial render
  useEffect(() => {
    if (clock.alarm != null && clock.remaining <= 0) {
      setShowPlaceholder(true);
    }
  }, []);

  useEffect(() => {
    if (clock.alarm == null) {
      return;
    }

    if (clock.remaining > 0) {
      if (showPlaceholder) {
        setShowPlaceholder(false);
      }
      return;
    }

    if (showPlaceholder) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowPlaceholder(true);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [clock, delay]);

  const displayValue = showPlaceholder ? placeholder.toString()
    : formatTimeString(clock.remaining);

  return (
    <span>{displayValue}&nbsp;({clock.type})</span>
  );
}
