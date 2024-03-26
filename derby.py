from dataclasses import dataclass

@dataclass()
class Skater:
    """Represents a skater and their number. Skaters can be uniquely identified by their number."""
    number: str
    name: str

    def __init__(self, number: str, name: str) -> None:
        number = number.strip()
        if len(number) == 0:
            raise ValueError("Skater number must contain a value")
        self.number = number
        name = name.strip()
        if len(name) == 0:
            raise ValueError("Skater name must contain a value")
        self.name = name

    def __str__(self) -> str:
        return f"{self.number}: {self.name}"

    def __hash__(self) -> int:
        return hash(self.number)

    def __eq__(self, other) -> bool:
        if isinstance(other, Skater):
            return self.number == other.number
        elif isinstance(other, str):
            return self.number == other
        else:
            return False
    
    def is_sanctionable(self) -> bool:
        return self.number.isnumeric() and len(self.number) <= 4


class Team:
    def __init__(self, league_name: str, team_name: str, color = None) -> None:
        self.league_name: str = league_name
        self.name: str = team_name
        self._color = color  # TODO
        self._roster: list[Skater] = list()

    def __getitem__(self, key: str) -> Skater:
        if not isinstance(key, str):
            raise ValueError(f"Team indices must be string, not {type(key).__name__}")
        elif key not in self._roster:
            return None
        else:
            return self._roster[self._roster.index(key)]
    
    def __iter__(self) -> Skater:
        return self._roster.__iter__()
    
    def __next__(self) -> Skater:
        return self._roster.__next__()
    
    def __str__(self) -> str:
        return f"{self.league_name}, {self.name}"

    def __len__(self) -> int:
        return len(self._roster)
    
    def add(self, skater: Skater) -> bool:
        if not isinstance(skater, Skater) or skater in self._roster:
            return False
        self._roster.append(skater)
        return True
    
    def remove(self, skater: Skater | str) -> bool:
        if skater not in self._roster:
            return False
        self._roster.remove(skater)
        return True