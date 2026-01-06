#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/scripts/python/add_header_to_file.py

import sys
from pathlib import Path

LICENSE = "AGPL-3.0-or-later"
DEFAULT_SHEBANG = "#!/usr/bin/env python3\n"

COMMENT = {
    ".py": "#",
    ".ts": "//",
    ".tsx": "//",
    ".js": "//",
    ".jsx": "//",
}


def is_script(path: Path) -> bool:
    return "scripts" in path.parts


def main(paths: list[str]) -> int:
    changed = False

    for raw in paths:
        path = Path(raw)
        if not path.is_file() or path.suffix not in COMMENT:
            continue

        prefix = COMMENT[path.suffix]
        spdx = f"{prefix} SPDX-License-Identifier: {LICENSE}\n"
        file_line = f"{prefix} File: {path.as_posix()}\n"

        lines = path.read_text().splitlines(keepends=True)

        new_lines: list[str] = []
        idx = 0

        # --- Shebang handling
        has_shebang = lines and lines[0].startswith("#!")

        if is_script(path):
            if has_shebang:
                new_lines.append(lines[0])
                idx = 1
            else:
                new_lines.append(DEFAULT_SHEBANG)

        # --- Normalize leading blank lines (after shebang) ---
        while idx < len(lines) and lines[idx] == "\n":
            idx += 1

        # --- Header ---
        header = [spdx, file_line]

        if lines[idx : idx + 2] == header:
            # Header already present
            new_lines.extend(lines[idx:])
        else:
            # Insert header + blank line, keep ALL original content
            new_lines.extend(header)
            new_lines.append("\n")
            new_lines.extend(lines[idx:])

        if new_lines != lines:
            path.write_text("".join(new_lines))
            print(f"Updated header: {path}")
            changed = True

    return 1 if changed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
