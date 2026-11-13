import { TripEvent } from "@/types/jam";
import { Divider, Fieldset, FieldsetProps, Stack } from "@mantine/core";
import JammerStatusController from "./jammer-status-controller";
import JammerTrip from "./jammer-trip";
import TripAdder from "./trip-adder";
import TripController from "./trip-controller";

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
  return (
    <Fieldset px="0" pb="0" {...props}>
      <Stack justify="space-between" align="center" gap="0">
        <JammerStatusController
          teamUuid={teamUuid}
          jammerLead={jammerLead}
          jammerLost={jammerLost}
          jammerStarPass={jammerStarPass}
          leadIsDeclared={disableLeadCheckbox}
          disabled={disabled}
          justify="space-between"
          align="center"
          p="sm"
        />
        <TripAdder
          teamUuid={teamUuid}
          showInitial={!jammerHasInitial}
          pointsPerTrip={pointsPerTrip}
          disabled={disabled}
          px="lg"
          py="xs"
          w="100%"
        />
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
