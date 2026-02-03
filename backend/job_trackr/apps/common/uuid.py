# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/common/uuid.py

from uuid import UUID

from uuid6 import uuid7


def uuid7_default() -> UUID:
    return uuid7()
