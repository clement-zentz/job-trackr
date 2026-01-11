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
        header = [spdx, file_line]

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

        # --- Skip blank lines after shebang ---
        while idx < len(lines) and lines[idx] == "\n":
            idx += 1

        # --- Remove existing SPDX header (idempotent core) ---
        def is_spdx(line: str) -> bool:
            return "SPDX-License-Identifier:" in line

        def is_file_line(line: str, *, prefix: str = prefix) -> bool:
            return line.lstrip().startswith(f"{prefix} File:")

        if idx < len(lines) and is_spdx(lines[idx]):
            idx += 1
            if idx < len(lines) and is_file_line(lines[idx]):
                idx += 1

            # Skip blank lines after old header
            while idx < len(lines) and lines[idx] == "\n":
                idx += 1

        # --- Insert canonical header ---
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
