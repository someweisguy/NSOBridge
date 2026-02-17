import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useContext } from "react";

export default function TimeoutCallingTeamEditor({
  ...props
}: Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PrimaryBoutStatus must be used within a BoutProvider");
  }
  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        Calling Team
      </Text>
      <SegmentedControl
        data={[
          // TODO: labels should display Roster name/mnemonic
          { value: String(bout.teams[0].num), label: "Home" },
          { value: String(bout.teams[1].num), label: "Away" },
          {
            value: String(NaN),
            label: "Official",
            disabled: false, // FIXME: disable if timeout.isReview,
          },
        ]}
        value={
          ""
          // FIXME
          // timeout.teamNum == null
          //   ? timeout.teamIsOfficials
          //     ? String(NaN)
          //     : ""
          //   : String(timeout.teamNum)
        }
        transitionDuration={200} // TODO: set duration = 0 if no value selected
        onChange={
          (teamNum) => console.log(teamNum) // FIXME
          // setTeam.mutate(teamNum == String(NaN) ? null : Number(teamNum))
        }
        {...props}
      />
    </Stack>
  );
}
