#!/usr/bin/env python
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/scripts/python/generate_secret_key.py

from django.core.management.utils import get_random_secret_key

print(get_random_secret_key())
