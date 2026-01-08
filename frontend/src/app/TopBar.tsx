// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/TopBar.tsx

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <span className="text-sm font-medium">Applications</span>

      <div className="flex items-center gap-2">
        {/* Placeholder for search / filters / add button */}
        <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
          + Add
        </button>
      </div>
    </header>
  );
}
