import { InputType } from "storybook/internal/csf";

export const jamStopReasonArgType: InputType = {
  control: "select",
  options: ["called", "elapsed", "injury", "other", null],
};

export const boutStateArgType: InputType = {
  control: "select",
  options: ["jam", "lineup", "timeout", "final", "stopped"],
};

export const boutSubStateArgType: InputType = {
  control: "select",
  options: [
    "pregame",
    "halftime",
    "unofficial",
    "lineup",
    "post_review",
    "post_timeout",
    "jam",
    "timeout",
    "review",
    "team_timeout",
    "official_timeout",
    "final",
  ],
};
