# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_trackr/common/test_normalization.py

# backend/tests/integration/job_trackr/common/test_normalization.py

from apps.common.normalization import normalize_text


def test_normalize_text_none():
    assert normalize_text(None) is None


def test_normalize_text_empty_string():
    assert normalize_text("") is None


def test_normalize_text_whitespace_only():
    assert normalize_text("   ") is None


def test_normalize_text_lowercase():
    assert normalize_text("Backend Engineer") == "backend engineer"


def test_normalize_text_accents():
    assert normalize_text("café ingénieur") == "cafe ingenieur"


def test_normalize_text_punctuation_removed():
    assert normalize_text("Python Developer!") == "python developer"
    assert normalize_text("Python Developer?") == "python developer"


def test_normalize_text_remove_symbols():
    assert normalize_text("Cloud Devops (Go - Python)") == "cloud devops go - python"


def test_normalize_text_keep_semantic_symbols():
    assert normalize_text("C++ Developer") == "c++ developer"
    assert normalize_text("C# Developer") == "c# developer"


def test_normalize_text_keep_semantic_punctuation():
    assert normalize_text("Node.js Developer") == "node.js developer"
    assert normalize_text("ASP.net Developer") == "asp.net developer"


def test_normalize_text_whitespace_collapse():
    assert normalize_text("Backend    Engineer") == "backend engineer"


def test_normalize_text_only_punctuation():
    assert normalize_text("!!!") is None
