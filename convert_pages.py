#!/usr/bin/env python3
import os
import re
from pathlib import Path

STATIC_DIR = Path("static_site")
ASTRO_PAGES_DIR = Path("astro-site/src/pages")

def extract_title_from_html(html_content):
    match = re.search(r'<title>([^<]+)</title>', html_content)
    if match:
        return match.group(1)
    return "Page | Law Edge Solutions"

def extract_main_content(html_content):
    match = re.search(r'<main[^>]*>(.*?)</main>', html_content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def create_astro_page(page_name, html_content):
    title = extract_title_from_html(html_content)
    main_content = extract_main_content(html_content)

    if not main_content:
        print(f"  ⚠ No main content found in {page_name}.html")
        return False

    safe_title = title.replace('"', '&quot;')

    astro_lines = [
        "---",
        "import Layout from '../layouts/Layout.astro';",
        f'const title = "{safe_title}";',
        'const description = "Law Edge Solutions";',
        "---",
        "",
        "<Layout {title} {description}>",
        main_content,
        "</Layout>"
    ]

    astro_content = "\n".join(astro_lines)

    output_file = ASTRO_PAGES_DIR / f"{page_name}.astro"
    output_file.write_text(astro_content)
    print(f"  ✓ {page_name}.astro")
    return True

print("🔄 Converting static HTML pages to Astro...\n")

pages_to_convert = [
    "pricing", "about", "results", "blog", "contact",
    "law-firm-seo", "web-design", "ppc-google-ads", "local-seo",
    "legal-content", "automation",
    "personal-injury", "family-law", "criminal-defense", "estate-planning",
    "immigration", "business-law",
    "process", "service-areas", "practice-areas"
]

success_count = 0

for page in pages_to_convert:
    html_file = STATIC_DIR / f"{page}.html"

    if not html_file.exists():
        print(f"  ✗ Missing: {page}.html")
        continue

    try:
        html_content = html_file.read_text(encoding='utf-8')
        if create_astro_page(page, html_content):
            success_count += 1
    except Exception as e:
        print(f"  ✗ Error: {e}")

print(f"\n✅ Done! {success_count}/{len(pages_to_convert)} pages converted")
