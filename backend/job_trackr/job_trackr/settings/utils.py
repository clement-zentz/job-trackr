# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/utils.py

import os
from collections.abc import Sequence


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
    return os.environ.get(name, str(int(default))) in {"1", "true", "True"}
