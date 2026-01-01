# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/db/base.py
from sqlalchemy.orm import DeclarativeBase


# Base for all SQLAlchemy models
class Base(DeclarativeBase):
    pass
