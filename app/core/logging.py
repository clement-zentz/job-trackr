# app/core/logging.py

import logging, os, sys


LOG_FORMAT = (
    "%(levelname)s [%(asctime)s] "
    "%(name)s.%(funcName)s:%(lineno)d - %(message)s"
)

def setup_logging():
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format=LOG_FORMAT,
    )