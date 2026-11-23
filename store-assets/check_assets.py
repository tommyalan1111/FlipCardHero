from pathlib import Path
from PIL import Image

base = Path(r"E:\Work\FlipCardHero\store-assets")
prev = base / "preview"
prev.mkdir(exist_ok=True)

files = [base / "icon-512.png", base / "feature-graphic-1024x500.png", *sorted((base / "screenshots").glob("*.png"))]

for f in files:
    im = Image.open(f)
    alpha = ""
    if im.mode in ("RGBA", "LA"):
        lo, hi = im.getchannel("A").getextrema()
        alpha = f" alpha={lo}-{hi}"
    print(f"{f.relative_to(base)!s:42} {im.size[0]}x{im.size[1]} {im.mode} {im.format}{alpha} {f.stat().st_size // 1024}KB")

icon = Image.open(base / "icon-512.png").convert("RGB")
for size in (48, 72, 96):
    icon.resize((size, size), Image.LANCZOS).save(prev / f"icon-{size}.png")
    print("preview", f"icon-{size}.png")
