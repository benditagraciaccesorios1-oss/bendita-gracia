"""Create illustrative, product-only WebP crops from the supplied mockups.

These are reference renders, not photographs or a confirmed product inventory.
Do not extract navigation, headings, buttons or complete page compositions.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/references'
OUT.mkdir(parents=True, exist_ok=True)
# Crops shown larger than their pixels; scripts/upscale-photos.py enlarges them with AI into images/ai/references/.
AI = ROOT / 'images' / 'ai' / 'references'
ENLARGED = {'hero-floral', 'hero-velas-florales', 'hero-figuras', 'hero-sachet', 'peonia-morada'}
EXPORT = Path(sys.argv[sys.argv.index('--export') + 1]) if '--export' in sys.argv else None

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
        crop = image.crop(box).convert('RGB')
    if EXPORT:
        if name in ENLARGED:
            crop.save(EXPORT / f'{name}.png')
        continue
    if name in ENLARGED and (AI / f'{name}.webp').exists():
        with Image.open(AI / f'{name}.webp') as enlarged:
            crop = enlarged.convert('RGB')
    crop.save(OUT / f'{name}.webp', quality=93, method=6)
    print(f'{name}.webp: {crop.width}x{crop.height}')
