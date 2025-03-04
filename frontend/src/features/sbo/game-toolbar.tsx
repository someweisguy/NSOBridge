import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoutIdContext } from "@/contexts/bout-id";
import useBout from "@/hooks/use-bout";
import { useConnection } from "@/hooks/use-connection";
import dispatchRequest from "@/lib/client";
import { BoutIdType } from "@/types/bout";
import { ReactElement, useCallback, useContext, useMemo } from "react";

export default function GameToolbar(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const [playState, scoreState] = useBout<
    ["stopped" | "jam" | "lineup" | "timeout", string]
  >(boutId, (bout) => [bout.playState, bout.scoreState]);

  const buttonRows = useMemo(() => {
    return {
      stopped: <Stopped boutId={boutId} />,
      jam: <Jam boutId={boutId} />,
      lineup: <Lineup boutId={boutId} />,
      timeout: <Timeout boutId={boutId} />,
    };
  }, [boutId]);

  let buttons;
  if (scoreState === "final") {
    // If the Bout is final, do not show any buttons
    buttons = <></>;
  } else {
    buttons = buttonRows[playState];
  }

  return <Card className="p-2 flex flex-row">{buttons}</Card>;
}

function Stopped({ boutId }: { boutId: BoutIdType }) {
  const { latency } = useConnection();

  const startJam = useCallback(() => {
    void dispatchRequest("bout", "startJam", { boutId, latency });
  }, [boutId, latency]);

  // TODO: Start Lineup, Start Intermission Clock

  return (
    <>
      <Button variant="outline" onClick={startJam}>
        Start Jam
      </Button>
      <Button variant="ghost">Start Lineup</Button>
      <Button variant="ghost">Start Intermission Clock</Button>
    </>
  );
}

function Jam({ boutId }: { boutId: BoutIdType }) {
  const { latency } = useConnection();

  const stopJam = useCallback(() => {
    void dispatchRequest("bout", "stopJam", { boutId, latency });
  }, [boutId, latency]);

  return (
    <>
      <Button variant="outline" onClick={stopJam}>
        End Jam
      </Button>
      <Button variant="ghost">End Jam and Call Timeout</Button>
      <Button variant="ghost">End Jam and Period</Button>
    </>
  );
}

function Lineup({ boutId }: { boutId: BoutIdType }) {
  const { latency } = useConnection();

  const startJam = useCallback(() => {
    void dispatchRequest("bout", "startJam", { boutId, latency });
  }, [boutId, latency]);

  const callTimeout = useCallback(() => {
    void dispatchRequest("bout", "callTimeout", { boutId, latency });
  }, [boutId, latency]);

  return (
    <>
      <Button variant="outline" onClick={startJam}>
        Start Jam
      </Button>
      <Button variant="ghost" onClick={callTimeout}>
        Call Timeout
      </Button>
      <Button variant="ghost">End Period</Button>
    </>
  );
}

function Timeout({ boutId }: { boutId: BoutIdType }) {
  const { latency } = useConnection();

  const endTimeout = useCallback(() => {
    void dispatchRequest("bout", "endTimeout", { boutId, latency });
  }, [boutId, latency]);

  return (
    <>
      <ToggleGroup type="single">
        <ToggleGroupItem value="timeout">Timeout</ToggleGroupItem>
        <ToggleGroupItem value="officialReview">
          Official Review
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single">
        <ToggleGroupItem value="official">Official</ToggleGroupItem>
        <ToggleGroupItem value="home">Home</ToggleGroupItem>
        <ToggleGroupItem value="away">Away</ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant="ghost"
        onClick={() => {
          return;
        }}
      >
        <Checkbox checked={false} />
        Retained
      </Button>
      <Button variant="outline" onClick={endTimeout}>
        End Timeout
      </Button>
    </>
  );
}
