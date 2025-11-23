from typing import Final

from fastapi import APIRouter

from .dependencies import TimeoutDepends, get_timeout
from .schemas import TimeoutSchema

router: Final[APIRouter] = APIRouter(prefix='/timeout')
router.add_api_route('', get_timeout, response_model=TimeoutSchema | None)


@router.post('/type')
async def set_type(timeout: TimeoutDepends) -> None:
    pass  # TODO: set timeout team and whether or not the timeout is a review


@router.post('/retained')
async def set_retained(timeout: TimeoutDepends) -> None:
    pass  # TODO: set whether or not the timeout is retained


@router.put('/details')
async def set_details(timeout: TimeoutDepends) -> None:
    pass  # TODO: set timeout.details


@router.put('/result')
async def set_result(timeout: TimeoutDepends) -> None:
    pass  # TODO: set timeout.result
