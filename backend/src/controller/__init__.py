from .controller import Controller, register


@register('getVersion')
def get_version(controller: Controller) -> str:
    return {
        'app': '0.0.1',
        'api': '0.0.1',
    }


__all__ = ['Controller', 'register']