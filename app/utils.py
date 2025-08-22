import functools
import inspect
import logging
import traceback
import typing
import time


T = typing.TypeVar("T")
R = typing.TypeVar("R")
P = typing.ParamSpec("P")

log = logging.getLogger(__name__)


def classproperty(func: typing.Callable[[typing.Type[T]], R]) -> R:
    class _CP:
        __slots__ = ()  # no instance dict

        def __get__(self, instance: typing.Any, owner: typing.Type[T]) -> R:
            return func(owner)

    return _CP()


def catch(
    _func: typing.Callable[P, typing.Union[T, typing.Awaitable[T]]] | None = None,
    *,
    reraise: bool = False,
) -> typing.Union[
    typing.Callable[[typing.Callable[P, T]], typing.Callable[P, typing.Optional[T]]],
    typing.Callable[P, typing.Optional[T]],
    typing.Callable[P, typing.Awaitable[typing.Optional[T]]],
]:
    def decorator(fn: typing.Callable[P, typing.Union[T, typing.Awaitable[T]]]) -> typing.Union[
        typing.Callable[P, typing.Optional[T]],
        typing.Callable[P, typing.Awaitable[typing.Optional[T]]],
    ]:
        @functools.wraps(fn)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> typing.Optional[T]:
            try:
                return fn(*args, **kwargs)  # type: ignore
            except Exception as e:
                log.exception(f"Exception in {fn.__name__}: {e}\n{traceback.format_exc()}")
                if reraise:
                    raise
                return None

        @functools.wraps(fn)
        async def awrapper(*args: P.args, **kwargs: P.kwargs) -> typing.Optional[T]:
            try:
                return await fn(*args, **kwargs)  # type: ignore
            except Exception as e:
                log.exception(f"Exception in {fn.__name__}: {e}\n{traceback.format_exc()}")
                if reraise:
                    raise
                return None

        return awrapper if inspect.iscoroutinefunction(fn) else wrapper  # type: ignore

    # allow both @catch and @catch(reraise=True)
    if _func is None:
        return decorator
    else:
        return decorator(_func)  # type: ignore


def cached(
    func: typing.Callable[P, typing.Awaitable[T]] | None = None,
    *,
    ttl: int | None = None,
) -> (
    typing.Callable[P, typing.Awaitable[T]]
    | typing.Callable[
        [typing.Callable[P, typing.Awaitable[T]]],
        typing.Callable[P, typing.Awaitable[T]],
    ]
):
    cache: dict[tuple, tuple[float, T]] = {}

    def decorator(
        fn: typing.Callable[P, typing.Awaitable[T]],
    ) -> typing.Callable[P, typing.Awaitable[T]]:
        @functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            key = (*args, *sorted(kwargs.items()))
            now = time.time()

            if key in cache:
                timestamp, result = cache[key]
                if ttl is None or now - timestamp < ttl:
                    return result

            result = await fn(*args, **kwargs)
            cache[key] = (now, result)
            return result

        return wrapper

    if func is None:
        return decorator
    return decorator(func)
