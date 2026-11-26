// Junta a base da categoria com o que é próprio do produto, com a mesma regra do backend:
// acompanhamentos da categoria primeiro, sem repetir (sem diferenciar maiúsculas);
// um adicional do produto com o mesmo nome de um da categoria substitui o preço dele.
const key = (text) => String(text).trim().toLocaleLowerCase('pt-BR');

// Bebida só tem opções (sabores, marcas); alimento tem acompanhamentos e adicionais.
export const isDrink = (category) => category?.type === 'BEBIDA';

export function combineWithCategory(category, product) {
  if (isDrink(category)) {
    const seenOptions = new Set();
    const options = [...(category.options ?? []), ...(product.options ?? [])].filter((option) => {
      if (seenOptions.has(key(option))) return false;
      seenOptions.add(key(option));
      return true;
    });
    return { ...product, ings: [], extras: [], options };
  }

  const baseIngs = category?.ings ?? [];
  const baseExtras = category?.extras ?? [];

  const seen = new Set();
  const ings = [];
  for (const ing of [...baseIngs, ...(product.ings ?? [])]) {
    if (seen.has(key(ing))) continue;
    seen.add(key(ing));
    ings.push(ing);
  }

  const own = new Map((product.extras ?? []).map((extra) => [key(extra[0]), extra]));
  const extras = baseExtras.map((extra) => own.get(key(extra[0])) ?? extra);
  const fromCategory = new Set(baseExtras.map((extra) => key(extra[0])));
  extras.push(...(product.extras ?? []).filter((extra) => !fromCategory.has(key(extra[0]))));

  return { ...product, ings, extras, options: [] };
}
