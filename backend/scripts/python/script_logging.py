#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/scripts/python/script_logging.py

import logging
import sys


def setup_logging(
    *,
    level: int = logging.INFO,
    name: str | None = None,
) -> logging.Logger:
    """
    Configure logging for local scripts.

    - Logs to stdout
    - Simple, readable format
    - Safe to call multiple times
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    formatter = logging.Formatter(fmt="%(levelname)s | %(name)s | %(message)s")

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        logger.addHandler(handler)

    for handler in logger.handlers:
        handler.setLevel(level)
        handler.setFormatter(formatter)

    logger.propagate = False

    return logger
