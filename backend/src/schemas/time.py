from datetime import datetime

from pydantic import Field

from schemas.schemas import ClientSchema

# TODO: documentation, see https://en.wikipedia.org/wiki/Cristian%27s_algorithm

class ProcessTimeSchema(ClientSchema):
    process: datetime
    server: datetime = Field(default_factory=datetime.now)
