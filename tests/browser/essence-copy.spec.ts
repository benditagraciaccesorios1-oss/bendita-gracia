import { test, expect } from '@playwright/test';

const copy = [
  'Representa iluminación, calidez, vida y calma. Una vela no solo ilumina un espacio, sino que crea una atmósfera acogedora y llena de paz.',
  'Fragancias que transforman el ambiente, evocan emociones, despiertan recuerdos y brindan bienestar y calma.',
  'Destaca el valor estético de cada pieza. En Bendita Gracia, las velas son un elemento de decoración, elaboradas a mano para embellecer, dar vida y resaltar cualquier espacio o convertirse en el regalo perfecto.',
];

for (const width of [390, 1440]) {
  test(`approved essence copy remains complete and readable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const cards = page.locator('#esencia .essence-pillar');
    await expect(cards.locator('p')).toHaveText(copy);
    for (const card of await cards.all()) {
      expect(await card.evaluate(el => el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#esencia').screenshot({ path: testInfo.outputPath(`essence-${width}.png`) });
  });
}
