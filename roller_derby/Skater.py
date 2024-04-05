from dataclasses import dataclass


@dataclass
class Skater:
    """Represents a skater. Skaters have a jersey number, name, and optional pronouns."""

    number: str
    name: str
    pronouns: str

    def __init__(self, number: str, name: str, pronouns: str = "") -> None:
        number = number.strip()
        if len(number) == 0:
            raise ValueError("Skater number must contain a value")
        self.number = number
        name = name.strip()
        if len(name) == 0:
            raise ValueError("Skater name must contain a value")
        self.name = name
        self.pronouns = pronouns

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
        """Returns True if the skater number is valid for a sanctioned WFTDA
        game. Valid numbers contain at least one numeral but no more than four
        numerals."""
        return self.number.isnumeric() and len(self.number) <= 4
