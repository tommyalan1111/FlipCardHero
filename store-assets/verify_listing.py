import re
import unicodedata
from pathlib import Path

md_path = Path(r"E:\Work\FlipCardHero\store-assets\store-listing-vi.md")
md = unicodedata.normalize("NFC", md_path.read_text(encoding="utf-8"))


def n(s: str) -> int:
    return len(unicodedata.normalize("NFC", s))


short = re.search(r"^> (Đập bài tuổi thơ.*)$", md, re.M).group(1).strip()

alts = {}
for tag, body in re.findall(r"^\| ([BC]) \| (.+?) \| \d+ \|$", md, re.M):
    alts[tag] = body.strip()

start = md.index("> **FLIP CARD HERO")
m_end = re.search(r"\*\*[\d.]+ ký tự\*\*", md[start:])
end = start + m_end.start()
block = md[start:end]

lines = []
for line in block.splitlines():
    if line.startswith("> "):
        lines.append(line[2:])
    elif line.strip() == ">":
        lines.append("")
    elif line.strip() == "":
        lines.append("")
full_md = "\n".join(lines).strip()
full = full_md.replace("**", "")

name = "Flip Card Hero: Vua Đập Bài"

print(f"SHORT        {n(short):>4}  {short}")
for tag in sorted(alts):
    print(f"ALT {tag}       {n(alts[tag]):>4}  {alts[tag]}")
print(f"NAME         {n(name):>4}  {name}")
print(f"FULL (md)    {n(full_md):>4}")
print(f"FULL (plain) {n(full):>4}")

out_dir = Path(r"E:\Work\FlipCardHero\store-assets")
(out_dir / "store-listing-short.txt").write_text(short + "\n", encoding="utf-8")
(out_dir / "store-listing-full.txt").write_text(full + "\n", encoding="utf-8")
legacy = out_dir / "store-listing-plain.txt"
if legacy.exists():
    legacy.unlink()
print("wrote store-listing-short.txt, store-listing-full.txt")

print("\n---- plain full ----\n")
print(full)
