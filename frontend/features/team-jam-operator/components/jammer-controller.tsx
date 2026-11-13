import { TripEvent } from "@/types/jam";
import {
  Button,
  Checkbox,
  createTheme,
  Divider,
  Fieldset,
  FieldsetProps,
  Group,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useAddTrip } from "../hooks/use-add-trip";
import { useSetLead } from "../hooks/use-set-lead";
import { useSetLost } from "../hooks/use-set-lost";
import { useSetStarPass } from "../hooks/use-set-star-pass";
import JammerTrip from "./jammer-trip";
import TripController from "./trip-controller";

const checkBoxTheme = createTheme({
  cursorType: "pointer", // Hovering over checkbox should change cursor
});

export interface JammerControllerProps extends FieldsetProps {
  teamUuid: string;
  teamIsInJam: boolean;
  jammerLead: boolean;
  jammerLost: boolean;
  jammerStarPass: boolean;
  jammerHasInitial: boolean;
  jammerTripEvents: TripEvent[];
  pointsPerTrip: number;
  disableLeadCheckbox: boolean;
}

export default function JammerController({
  teamUuid,
  teamIsInJam,
  jammerLead,
  jammerLost,
  jammerStarPass,
  jammerHasInitial,
  jammerTripEvents,
  pointsPerTrip,
  disableLeadCheckbox,
  disabled = false,
  ...props
}: JammerControllerProps) {
  const { mutate: setLead } = useSetLead({ teamUuid });
  const { mutate: setLost } = useSetLost({ teamUuid });
  const { mutate: setStarPass } = useSetStarPass({ teamUuid });
  const { mutate: createTrip } = useAddTrip({ teamUuid });

  return (
    <Fieldset px="0" pb="0" {...props}>
      <Stack justify="space-between" align="center" gap="0">
        <Fieldset disabled={disabled} variant="unstyled" my="sm">
          <MantineProvider theme={checkBoxTheme}>
            <Group justify="center" gap="md">
              <Checkbox
                label="Lead"
                checked={jammerLead}
                disabled={disableLeadCheckbox && !jammerLead}
                onClick={() => setLead(!jammerLead)}
                variant="outline"
                icon={(others) => <IconStarFilled {...others} />}
              />
              <Divider orientation="vertical" />
              <Checkbox
                label="Lost"
                checked={jammerLost}
                onClick={() => setLost(!jammerLost)}
                variant="outline"
              />
              <Divider orientation="vertical" />
              <Checkbox
                label="Star Pass"
                checked={jammerStarPass}
                onClick={() => setStarPass(!jammerStarPass)}
                variant="outline"
              />
            </Group>
          </MantineProvider>
        </Fieldset>
        <Group
          justify="space-around"
          align="center"
          wrap="nowrap"
          px="lg"
          py="xs"
          w="100%"
        >
          {!jammerHasInitial ? (
            <>
              <Button
                variant="subtle"
                disabled={disabled}
                onClick={() => createTrip(0)}
              >
                No Pass
              </Button>
              <Button
                variant="light"
                disabled={disabled}
                onClick={() => createTrip(pointsPerTrip)}
              >
                Initial
              </Button>
            </>
          ) : (
            Array.from({ length: pointsPerTrip + 1 }, (_, i) => (
              <Button
                key={i}
                variant={i == pointsPerTrip ? "light" : "subtle"}
                disabled={disabled}
                onClick={() => createTrip(i)}
              >
                {i}
              </Button>
            ))
          )}
        </Group>
        <Divider w="100%" />
        <TripController
          teamIsInThisJam={teamIsInJam}
          jammerInitial={jammerHasInitial}
          draggable={false}
          w="22rem"
          h="4rem"
          m="xs"
        >
          {jammerTripEvents
            .filter((tripEvent) => tripEvent.passes != null)
            .map((tripEvent: TripEvent, i: number) => (
              <JammerTrip
                enableEdit
                enableDelete
                key={tripEvent.uuid}
                uuid={tripEvent.uuid}
                timestamp={tripEvent.timestamp}
                lead={tripEvent.lead}
                lost={tripEvent.lost}
                starPass={tripEvent.starPass}
                passes={tripEvent.passes}
                pointsPerTrip={pointsPerTrip}
                tripIndex={i}
                w="4rem"
                h="3.5rem"
              />
            ))}
        </TripController>
      </Stack>
    </Fieldset>
  );
}
