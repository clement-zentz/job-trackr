# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/scripts/test_add_header_to_file_pep8_spacing.py

from pathlib import Path

from scripts.python.add_header_to_file import main


def _write(tmp_path: Path, rel: str, content: str) -> Path:
    p = tmp_path / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    return p


def test_two_blank_lines_before_top_level_def_after_header(tmp_path: Path) -> None:
    """
    Regression test for Ruff/PEP8 interaction.

    Files with only a SPDX header and a single top-level function (no imports)
    must have TWO blank lines before the function definition, otherwise
    ruff-format will reformat the file and cause a pre-commit loop.
    """
    p = _write(
        tmp_path,
        "backend/app/utils/only_def.py",
        "def foo() -> None:\n    pass\n",
    )

    # First run: header insertion + spacing normalization
    main([str(p)])
    first = p.read_text()

    # Second run: must be idempotent
    main([str(p)])
    second = p.read_text()

    assert first == second

    # Assert exact spacing
    lines = first.splitlines()

    assert lines[0].startswith("# SPDX-License-Identifier")
    assert lines[1].startswith("# File:")

    # Two blank lines before def (PEP 8 requirement)
    assert lines[2] == ""
    assert lines[3] == ""
    assert lines[4].startswith("def foo")
