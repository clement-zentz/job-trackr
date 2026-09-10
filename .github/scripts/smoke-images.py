# SPDX-License-Identifier: AGPL-3.0-or-later
# File: .github/scripts/smoke-images.py

import json
import os
import re
import time
from html.parser import HTMLParser
from urllib.error import URLError
from urllib.parse import urljoin
from urllib.request import urlopen

assert os.environ["DJANGO_SETTINGS_MODULE"] == "job_trackr.settings.prod"


class FrontendAssetsParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.scripts: list[str] = []
        self.stylesheets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "script" and (src := attributes.get("src")):
            self.scripts.append(src)
        if (
            tag == "link"
            and "stylesheet" in (attributes.get("rel") or "").split()
            and (href := attributes.get("href"))
        ):
            self.stylesheets.append(href)


def fetch(url: str) -> tuple[str, bytes]:
    attempts = 0
    while True:
        try:
            with urlopen(url, timeout=2) as response:
                return response.headers.get_content_type(), response.read()
        except (URLError, TimeoutError):
            attempts += 1
            if attempts == 30:
                raise
            time.sleep(1)


# Test the backend directly; proxy routes are configured by infrastructure.
backend_origin = "http://backend:8000"
content_type, body = fetch(f"{backend_origin}/api/_allauth/browser/v1/config")
assert content_type == "application/json", (backend_origin, content_type)
payload = json.loads(body)
assert payload["status"] == 200 and "account" in payload["data"], payload

content_type, login = fetch(f"{backend_origin}/admin/login/")
assert content_type == "text/html" and b'name="username"' in login
admin_css = re.search(rb'href="(/static/admin/css/base\.[a-f0-9]+\.css)"', login)
assert admin_css is not None, "Admin must reference manifest-hashed CSS"
content_type, css = fetch(f"{backend_origin}{admin_css[1].decode()}")
assert content_type == "text/css" and css, (backend_origin, content_type)

content_type, index = fetch("http://frontend/")
assert content_type == "text/html" and b'<div id="root">' in index

assets = FrontendAssetsParser()
assets.feed(index.decode("utf-8"))
assets.close()
assert assets.scripts, "Frontend must reference a JavaScript bundle"
assert assets.stylesheets, "Frontend must reference a CSS bundle"
for references, expected_types in (
    (assets.scripts, ("text/javascript", "application/javascript")),
    (assets.stylesheets, ("text/css",)),
):
    for reference in references:
        asset_url = urljoin("http://frontend/", reference)
        content_type, body = fetch(asset_url)
        assert content_type in expected_types, (asset_url, content_type)
        assert body.strip(), f"Frontend asset must not be empty: {asset_url}"

content_type, nested = fetch("http://frontend/login")
assert content_type == "text/html" and nested == index
print(
    "Production startup, backend API, admin static files, frontend bundles, "
    "and SPA routing checks passed."
)
