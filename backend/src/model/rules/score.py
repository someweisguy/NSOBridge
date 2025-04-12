from datetime import datetime

from ..state import Bout, Jam, JamId, Score, TeamType


class ScoreKeeper:
    def trip_added(self, bout: Bout, jam_id: JamId, team: TeamType,
                   points: int, timestamp: datetime, earned: bool) -> None:
        jam: Jam = bout.get_jam(jam_id)
        jam[team].trips.append(Score.Trip(points, timestamp))

        if earned and not jam.lead_is_declared():
            jam[team].lead = True

        # TODO: update clients

    def trip_edited(self, bout: Bout, jam_id: JamId, team: TeamType,
                    trip_id: int, points: int) -> None:
        jam: Jam = bout.get_jam(jam_id)
        jam[team].trips[trip_id].points = points

        # TODO: update clients

    def trip_deleted(self, bout: Bout, jam_id: JamId, team: TeamType,
                     trip_id: int) -> None:
        jam: Jam = bout.get_jam(jam_id)
        jam[team].trips.pop(trip_id)

        # TODO: update clients

    def lead_declared(self, bout: Bout, jam_id: JamId, team: TeamType,
                      lead: bool) -> None:
        jam: Jam = bout.get_jam(jam_id)
        if lead and jam.lead_is_declared():
            raise RuntimeError('A lead jammer has already been declared')
        jam[team].lead = lead

        # TODO: update clients

    def lost_lead(self, bout: Bout, jam_id: JamId, team: TeamType,
                  lost: bool) -> None:
        jam: Jam = bout.get_jam(jam_id)
        jam[team].lost = lost

        # TODO: update clients

    def star_pass(self, bout: Bout, jam_id: JamId, team: TeamType,
                  star_pass: bool) -> None:
        jam: Jam = bout.get_jam(jam_id)
        jam[team].star_pass = len(jam[team].trips) if star_pass else None

        # TODO: update clients
