import genericRequest from "./requests";

class Assignable {
  constructor(init?: Partial<Assignable>) {
    Object.assign(this, init);
  }
}

export class Clock extends Assignable {
  public readonly startTimestamp: Date | null;
  public readonly elapsed: number;
  public readonly alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

export class Timer extends Assignable {
  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly period: number;
  public readonly jam: number;
}

export class Bout extends Assignable {
  public readonly ruleset: string;
  public readonly clock: Clock;
  public readonly timer: Timer;

  constructor(init?: Partial<Bout>) {
    super(init);
    this.clock = Object.assign(new Clock(), init?.clock);
    this.timer = Object.assign(new Timer(), init?.timer);
  }

  test() {
    console.log("hello world!");
  }
}

export async function getBout(key: number): Promise<Bout> {
  const response: Partial<Bout> = await genericRequest("/api/bout", "GET", {
    key,
  });
  return new Bout(response);
}

/*
from datetime import datetime, timedelta
from typing import Any, Literal

from pydantic import Field, computed_field

from schemas.schemas import ServerSchema


class TimerSchema(ServerSchema):
    start_timestamp: datetime | None
    stop_timestamp: datetime | None


class TimeoutSchema(TimerSchema):
    period: int
    jam: int


class JamSchema(TimerSchema):
    period: int
    jam: int


class TeamSchema(ServerSchema):
    # TODO: name: str
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int


class BoutSchema(ServerSchema):
    key: tuple[Any, ...]
    ruleset: str
    clock: ClockSchema
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)
    intermission_timer: TimerSchema | None = Field(
        validation_alias='timer', exclude=True
    )

    @computed_field
    @property
    def jam_counts(self) -> list[int]:

    @computed_field
    @property
    def num_timeouts(self) -> int:
        return len(self.timeouts)

    @computed_field
    @property
    def active_jam(self) -> JamSchema | None:

    @computed_field
    @property
    def timer_type(self) -> Literal['timeout', 'intermission'] | None:

    @computed_field
    @property
    def timer(self) -> TimeoutSchema | TimerSchema | None:
*/
