import { ReactElement, useCallback, useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import useBout from "../../../hooks/useBout";
import dispatch from "../../../app/client";
import { useConnection } from "../../../hooks/useConnection";
import { BoutIdType } from "../../../types/bout";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function GameController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const [playState, scoreState] = useBout<[string, string]>(boutId, (bout) => [
    bout.playState,
    bout.scoreState,
  ]);

  const { latency } = useConnection();
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
          <ToggleGroup type="single">
            <ToggleGroupItem value="official">Official</ToggleGroupItem>
            <ToggleGroupItem value="home">Home</ToggleGroupItem>
            <ToggleGroupItem value="away">Away</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="max-w-fit">
          <ToggleGroup type="single">
            <ToggleGroupItem value="home">Home</ToggleGroupItem>
            <ToggleGroupItem value="away">Away</ToggleGroupItem>
          </ToggleGroup>
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
        <Button onClick={startStopJam} color="green">
          Start Jam
        </Button>
        <Button>Start Lineup</Button>
        <Button>Start Intermission Clock</Button>
      </div>
    );
  }
}
