from datetime import datetime
from uuid import UUID

from model import JamId, JamState, TeamType, TripState

from .abstract_keeper import AbstractKeeper


class ScoreKeeper(AbstractKeeper):
    def trip_added(self, bout_id: UUID, jam_id: JamId, team: TeamType,
                   points: int, timestamp: datetime, earned: bool) -> None:
        jam: JamState = self.get_bout(bout_id).get_jam(jam_id)
        jam[team].trips.append(TripState(points, timestamp))

        if earned and not jam.lead_is_declared():
            jam[team].lead = True

        # TODO: update clients

    def trip_edited(self, bout_id: UUID, jam_id: JamId, team: TeamType,
                    trip_id: int, points: int) -> None:
        jam: JamState = self.get_bout(bout_id).get_jam(jam_id)
        jam[team].trips[trip_id].points = points

        # TODO: update clients

    def trip_deleted(self, bout_id: UUID, jam_id: JamId, team: TeamType,
                     trip_id: int) -> None:
        jam: JamState = self.get_bout(bout_id).get_jam(jam_id)
        jam[team].trips.pop(trip_id)

        # TODO: update clients

    def lead_declared(self, jam_id: JamId, team: TeamType, lead: bool) -> None:
        pass

    def lost_lead(self, jam_id: JamId, team: TeamType, lost: bool) -> None:
        pass

    def star_pass(self, jam_id: JamId, team: TeamType, star_pass: bool) -> None:
        pass
