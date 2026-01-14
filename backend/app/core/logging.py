# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/core/logging.py

import logging
import sys

LOG_FORMAT = (
    "%(levelname)s [%(asctime)s] %(name)s.%(funcName)s:%(lineno)d - %(message)s"
)


def setup_logging():
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format=LOG_FORMAT,
    )
