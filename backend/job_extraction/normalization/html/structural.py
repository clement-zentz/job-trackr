# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/normalization/html/structural.py

from bs4 import BeautifulSoup, Comment


def strip_structure(html: str) -> BeautifulSoup:
    """
    Normalize HTML email content by removing non-structural and non-readable
    elements such as styles, comments, hidden preview text, tracking pixels,
    meta tags, and script tags.

    Returns a cleaned BeautifulSoup tree preserving meaningful content.
    """

    soup = BeautifulSoup(html, "html.parser")

    # # --- 1. Remove all <style> blocks (media queries + hacks)
    for style in soup.find_all("style"):
        style.decompose()

    # --- 2. Remove Outlook conditionnal comments and all comments
    for element in soup(text=lambda t: isinstance(t, Comment)):
        # Remove comments like <!--[if mso]> ... <![endif]-->
        if "if" in element or "mso" in element or "endif" in element:
            element.extract()
        else:
            element.extract()

    # --- 3. Remove preview text (hidden divs)
    for div in soup.find_all("div"):
        style = str(div.get("style", "")) or ""
        if "display:none" in style or "max-height:0" in style:
            div.decompose()

    # --- 4. Remove tracking pixels
    for img in soup.find_all("img"):
        w = img.get("width", "")
        h = img.get("height", "")
        if w in ("1", "0", "1px") or h in ("1", "0", "1px"):
            img.decompose()

    # --- 5. Remove meta tags (useless for readability)
    for meta in soup.find_all("meta"):
        meta.decompose()

    # --- 6. Remove <script> tags (rare in emails)
    for script in soup.find_all("script"):
        script.decompose()

    return soup
