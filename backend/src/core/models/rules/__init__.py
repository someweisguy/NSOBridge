from referees import REFEREES

assert len(REFEREES.items()) > 0, 'There must be at least 1 Referee defined'
assert any(len(referee.items()) > 0 for _, referee in REFEREES.items()), (
    'There must be at least 1 Referee defined with at least 1 Rule defined.'
)


__all__ = ('REFEREES', )