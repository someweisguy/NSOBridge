import { ReactElement, useCallback, useContext } from "react";
import Button from "../../../components/Button";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import useBout from "../../../hooks/useBout";
import ComboButton from "../../../components/ComboButton";
import dispatch from "../../../app/client";
import { useSocketState } from "../../../app/hooks/useConnection";

export default function GameController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const [playState, scoreState] = useBout<[string, string]>(boutId, (bout) => [
    bout.playState,
    bout.scoreState,
  ]);

  const { latency } = useSocketState();
  const startStopJam = useCallback(() => {
    if (playState !== "jam") {
      dispatch("bout", "startJam", { boutId, latency });
    } else {
      dispatch("bout", "stopJam", { boutId, latency });
    }
  }, [boutId, playState, latency]);

  const callEndTimeout = useCallback(() => {
    if (playState !== "timeout") {
      dispatch("bout", "callTimeout", { boutId, latency });
    } else {
      dispatch("bout", "endTimeout", { boutId, latency });
    }
  }, [boutId, playState, latency]);

  if (scoreState === "final") {
    return <></>;
  }

  if (playState === "jam") {
    return (
      <div className="gap-4 grid grid-cols-3">
        <Button onClick={startStopJam} color="red">
          End Jam
        </Button>
        <Button>End Jam and Call Timeout</Button>
        <Button>End Jam and End Period</Button>
      </div>
    );
  } else if (playState === "lineup") {
    return (
      <div className="gap-4 grid grid-cols-3">
        <Button onClick={startStopJam} color="green">
          Start Jam
        </Button>
        <Button onClick={callEndTimeout}>Call Timeout</Button>
        <Button>End Period</Button>
      </div>
    );
  } else if (playState === "timeout") {
    return (
      <div className="gap-4 grid grid-cols-4">
        <div className="max-w-fit">
          <ComboButton>
            <Button>Official</Button>
            <Button>Home</Button>
            <Button>Away</Button>
          </ComboButton>
        </div>
        <div className="max-w-fit">
          <ComboButton>
            <Button>Home</Button>
            <Button>Away</Button>
          </ComboButton>
        </div>
        <Button>Retained</Button>
        <Button onClick={callEndTimeout} color="red">
          End Timeout
        </Button>
      </div>
    );
  } else {
    return (
      <div className="gap-4 grid grid-cols-3">
        <Button onClick={startStopJam} color="green">Start Jam</Button>
        <Button>Start Lineup</Button>
        <Button>Start Intermission Clock</Button>
      </div>
    );
  }
}
