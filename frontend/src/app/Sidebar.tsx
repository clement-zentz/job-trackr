// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/Sidebar.tsx

import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/applications", label: "Applications" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <h1 className="mb-6 text-lg font-semibold">Job Tracker</h1>

      <nav className="space-y-2">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "block rounded px-3 py-2 text-sm",
                isActive
                  ? "bg-gray-200 font-medium"
                  : "text-gray-600 hover:bg-gray-100",
              ].join(" ")
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
