# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/utils.py

import os
from collections.abc import Sequence

from django.core.exceptions import ImproperlyConfigured


def env_list(
    name: str,
    *,
    default: Sequence[str] = (),
) -> list[str]:
    raw = os.environ.get(name)
    if not raw:
        return list(default)
    return [v.strip() for v in raw.split(",") if v.strip()]


def env_bool(name: str, default: bool = False) -> bool:
    return (
        os.environ.get(name, str(int(default))) in {"1", "true", "True", "yes", "on"}
        if name in os.environ
        else default
    )


def env(name: str) -> str:
    value = os.environ.get(name)
    if value is None:
        raise ImproperlyConfigured(f"Missing required env var: {name}")
    return value
