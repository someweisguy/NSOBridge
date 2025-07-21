from .referees import REFEREES

assert len(REFEREES.items()) > 0, 'There must be at least 1 Referee defined'


__all__ = ('REFEREES',)
