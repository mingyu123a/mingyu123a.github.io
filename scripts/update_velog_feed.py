#!/usr/bin/env python3
"""
Fetch Velog RSS and write a trimmed JSON snapshot for the site.
"""
from __future__ import annotations

import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


RSS_URL = "https://v2.velog.io/rss/@mgh0115"
TARGET_PATH = Path(__file__).resolve().parents[1] / "data" / "velog-feed.json"
EXCLUDED_KEYWORDS = ["layer7", "pwn", "해킹"]
MAX_ITEMS = 4


def sanitize(text: str) -> str:
    if not text:
        return ""
    clean = html.unescape(text)
    clean = re.sub(r"<[^>]+>", "", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def truncate(text: str, length: int = 220) -> str:
    if len(text) <= length:
        return text
    return text[: length].rstrip() + "..."


def infer_tags(title: str, categories: list[str]) -> list[str]:
    tags: list[str] = []
    lower_title = title.lower()
    lower_cats = [c.lower() for c in categories]

    def add(tag: str):
        if tag and tag not in tags and len(tags) < 2:
            tags.append(tag)

    if "oracle" in lower_title or "oracle" in lower_cats:
        add("Oracle")
    if "mysql" in lower_title or "mysql" in lower_cats:
        add("MySQL")
    if "sql" in lower_title or "sql" in lower_cats:
        add("SQL")
    if "view" in lower_title:
        add("VIEW")
    if not tags and categories:
        add(categories[0][:12])
    if not tags:
        add("Note")
    return tags[:2]


def fetch_rss() -> bytes:
    with urllib.request.urlopen(RSS_URL, timeout=10) as response:
        return response.read()


def build_snapshot(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    items = root.findall(".//item")
    posts: list[dict] = []

    for item in items:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        desc_raw = item.findtext("description") or ""
        categories = [c.text.strip() for c in item.findall("category") if c.text]

        if not title or not link:
            continue
        lower_title = title.lower()
        if any(bad in lower_title for bad in EXCLUDED_KEYWORDS):
            continue

        desc = truncate(sanitize(desc_raw), 220)
        tags = infer_tags(title, categories)
        posts.append({"title": title, "link": link, "tags": tags, "desc": desc})

        if len(posts) >= MAX_ITEMS:
            break

    return posts


def main() -> int:
    try:
        xml_bytes = fetch_rss()
        snapshot = build_snapshot(xml_bytes)
        if not snapshot:
            raise RuntimeError("No posts parsed from RSS.")
        TARGET_PATH.parent.mkdir(parents=True, exist_ok=True)
        TARGET_PATH.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {len(snapshot)} items to {TARGET_PATH}")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to update feed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
