class Team:
    HOME: str = "home"
    AWAY: str = "away"

    def __init__(self) -> None:
        self._league_name = ""
        self._name = ""

    @property
    def league(self) -> str:
        return self._league_name

    @league.setter
    def league(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError(f"league must be str, not {type(value).__name__}")
        self._league_name = value

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError(f"name must be str, not {type(value).__name__}")
        self._name = value
