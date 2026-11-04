"""Create illustrative, product-only WebP crops from the supplied mockups.

These are reference renders, not photographs or a confirmed product inventory.
Do not extract navigation, headings, buttons or complete page compositions.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/references'
OUT.mkdir(parents=True, exist_ok=True)

CROPS = {
    'hero-floral': ('01-inicio.png', (552, 0, 1536, 290)),
    'category-floral': ('01-inicio.png', (83, 555, 503, 758)),
    'category-figures': ('01-inicio.png', (553, 556, 971, 758)),
    'category-sachet': ('01-inicio.png', (1029, 556, 1450, 758)),
    # Bottom edges stop above the mockups' printed «Imagen ilustrativa» labels;
    # the site renders its own HTML label.
    'rosas-rosa': ('03-detalle.png', (132, 132, 710, 455)),
    'rosas-marfil': ('02-catalogo.png', (549, 343, 783, 548)),
    'peonia-en-domo': ('02-catalogo.png', (1040, 343, 1287, 548)),
    'peonia-morada': ('02-catalogo.png', (51, 631, 301, 838)),
    'figuras-con-estrella': ('02-catalogo.png', (549, 633, 811, 838)),
    'sachet-botanico': ('02-catalogo.png', (1040, 632, 1319, 838)),
    # Wide home-carousel scenes from the mobile mockup's larger category cards, inside their wax rims.
    'hero-velas-florales': ('04-movil.png', (76, 958, 650, 1158)),
    'hero-figuras': ('04-movil.png', (78, 1281, 650, 1474)),
    'hero-sachet': ('04-movil.png', (76, 1600, 650, 1796)),
}

for name, (source, box) in CROPS.items():
    with Image.open(ROOT / 'mockups' / source) as image:
        image.crop(box).convert('RGB').save(OUT / f'{name}.webp', quality=93, method=6)
    print(f'{name}.webp: {box[2] - box[0]}x{box[3] - box[1]}')
