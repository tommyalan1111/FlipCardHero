"""Sinh toàn bộ icon Android (legacy + adaptive) và icon PWA từ asset đã render."""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"E:\Work\FlipCardHero")
ASSETS = ROOT / "store-assets"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
RENDER = ASSETS / "render"

icon512 = Image.open(ASSETS / "icon-512.png").convert("RGB")
fg512 = Image.open(RENDER / "adaptive-foreground-512.png").convert("RGBA")
bg512 = Image.open(RENDER / "adaptive-background-512.png").convert("RGB")

# --- kiểm tra vùng an toàn của foreground ---
alpha = fg512.getchannel("A")
lo, hi = alpha.getextrema()
bbox = alpha.getbbox()
safe_d = round(66 / 108 * 512)
print(f"foreground alpha={lo}-{hi} bbox={bbox}")
if bbox:
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    print(f"foreground content={w}x{h}px  safe-zone={safe_d}px  ratio={max(w, h) / safe_d:.2f}")
if lo == 255:
    raise SystemExit("foreground không có alpha trong suốt — kiểm tra lại render")

LEGACY = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
ADAPTIVE = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

for dens in LEGACY:
    d = RES / f"mipmap-{dens}"
    d.mkdir(parents=True, exist_ok=True)

    icon512.resize((LEGACY[dens], LEGACY[dens]), Image.LANCZOS).save(
        d / "ic_launcher.png", optimize=True
    )
    bg512.resize((ADAPTIVE[dens], ADAPTIVE[dens]), Image.LANCZOS).save(
        d / "ic_launcher_background.png", optimize=True
    )
    fg512.resize((ADAPTIVE[dens], ADAPTIVE[dens]), Image.LANCZOS).save(
        d / "ic_launcher_foreground.png", optimize=True
    )
    print(f"mipmap-{dens}: legacy {LEGACY[dens]}px, adaptive {ADAPTIVE[dens]}px")

# --- icon PWA ---
web = ROOT / "icons"
icon512.save(web / "icon-512.png", optimize=True)
icon512.resize((192, 192), Image.LANCZOS).save(web / "icon-192.png", optimize=True)

# Maskable: vùng an toàn của PWA là đường tròn 80% (bán kính 205px trên 512).
# Thu foreground còn 90% để góc lá bài không bị mask cắt.
fg_maskable = fg512.resize((round(512 * 0.9), round(512 * 0.9)), Image.LANCZOS)
off = (512 - fg_maskable.width) // 2
maskable = bg512.copy()
maskable.paste(fg_maskable, (off, off), fg_maskable)
maskable.save(web / "icon-maskable-512.png", optimize=True)
maskable.resize((192, 192), Image.LANCZOS).save(web / "icon-maskable-192.png", optimize=True)
print("PWA icons: icon-192/512 + icon-maskable-192/512")

# --- preview: icon tròn, squircle, legacy ---
def masked(img: Image.Image, size: int, shape: str) -> Image.Image:
    img = img.convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    m = ImageDraw.Draw(mask)
    if shape == "circle":
        m.ellipse((0, 0, size - 1, size - 1), fill=255)
    else:
        m.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.23), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


preview = Image.new("RGB", (1240, 620), "#101c2e")
pd = ImageDraw.Draw(preview)
adaptive_flat = bg512.copy()
adaptive_flat.paste(fg512, (0, 0), fg512)

cells = [
    ("store icon (512)", icon512, 240, "square"),
    ("adaptive - tròn", adaptive_flat, 240, "circle"),
    ("adaptive - squircle", adaptive_flat, 240, "squircle"),
]
x = 40
for label, img, size, shape in cells:
    if shape == "square":
        thumb = img.resize((size, size), Image.LANCZOS)
    else:
        thumb = masked(img, size, shape)
    preview.paste(thumb, (x, 90), thumb if thumb.mode == "RGBA" else None)
    pd.text((x, 60), label, fill="#e2e8f0")
    x += size + 60

# hàng icon nhỏ để kiểm tra độ đọc ở kích thước thật
small_x = 40
for s in (48, 72, 96):
    thumb = icon512.resize((s, s), Image.LANCZOS)
    preview.paste(thumb, (small_x, 450))
    small_x += s + 70

adaptive_small = adaptive_flat.resize((96, 96), Image.LANCZOS)
small_mask = masked(adaptive_flat, 96, "circle")
preview.paste(small_mask, (small_x + 90, 450), small_mask)
pd.text((40, 410), "kiểm tra ở kích thước thật (48 / 72 / 96 px) + adaptive 96", fill="#94a3b8")

(ASSETS / "preview").mkdir(exist_ok=True)
preview.save(ASSETS / "preview" / "adaptive-preview.png", optimize=True)
print("wrote preview/adaptive-preview.png")
