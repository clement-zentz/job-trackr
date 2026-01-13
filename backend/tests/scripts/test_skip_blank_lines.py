# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/scripts/test_skip_blank_lines.py

from scripts.python.add_header_to_file import skip_blank_lines


def test_skip_blank_lines_no_blank_lines() -> None:
    lines = ["a\n", "b\n"]
    idx = skip_blank_lines(lines, 0)

    assert idx == 0


def test_skip_blank_lines_single_blank_line() -> None:
    lines = ["\n", "a\n"]
    idx = skip_blank_lines(lines, 0)

    assert idx == 1


def test_skip_blank_lines_multiple_blank_lines() -> None:
    lines = ["\n", "\n", "\n", "a\n"]
    idx = skip_blank_lines(lines, 0)

    assert idx == 3


def test_skip_blank_lines_starting_in_middle() -> None:
    lines = ["a\n", "\n", "\n", "b\n"]
    idx = skip_blank_lines(lines, 1)

    assert idx == 3


def test_skip_blank_lines_all_blank_lines() -> None:
    lines = ["\n", "\n"]
    idx = skip_blank_lines(lines, 0)

    assert idx == len(lines)


def test_skip_blank_lines_out_of_bounds() -> None:
    lines = ["a\n"]
    idx = skip_blank_lines(lines, 1)

    assert idx == 1
