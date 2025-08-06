from datetime import datetime

from pydantic import Field

from schemas.schemas import ClientSchema


class ProcessTimeSchema(ClientSchema):
    process: datetime
    server: datetime = Field(default_factory=datetime.now)
