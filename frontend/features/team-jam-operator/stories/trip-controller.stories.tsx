import { TripEvent } from "@/types/jam";
import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerTrip from "../components/jammer-trip";
import TripController from "../components/trip-controller";

const meta: Meta = {
  component: TripController,
  title: "TeamJam Operator/Trip Controller",
  argTypes: {
    children: {
      control: false,
    },
  },
};

type Story = StoryObj<typeof meta>;

const tripEvents: TripEvent[] = [
  {
    uuid: "8cbb4512-cc82-4a52-a293-c48c7cf1ad13",
    timestamp: "2026-10-17T22:18:41.186364",
    lead: false,
    lost: false,
    passes: 0,
    starPass: false,
  },
  {
    uuid: "27b54a6d-b43a-4cde-a993-a32e808fb93b",
    timestamp: "2026-10-17T22:18:42.561548",
    lead: false,
    lost: false,
    passes: 4,
    starPass: false,
  },
  {
    uuid: "06cfbe40-aa70-48e7-a868-a3ea624251fa",
    timestamp: "2026-10-17T22:18:44.171954",
    lead: false,
    lost: false,
    passes: 4,
    starPass: false,
  },
  {
    uuid: "5d5db80a-de7e-4f14-834b-4c605d34070c",
    timestamp: "2026-10-17T22:19:28.273519",
    lead: true,
    lost: false,
    passes: null,
    starPass: false,
  },
];

export const Default: Story = {
  args: {
    teamIsInThisJam: true,
    jammerInitial: true,
    children: tripEvents
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
          pointsPerTrip={4}
          tripIndex={i}
          w="4rem"
          h="3.5rem"
        />
      )),
  },
};

export const NoTrips: Story = {
  args: {
    teamIsInThisJam: true,
    jammerInitial: false,
  },
};

export default meta;
