import test from 'node:test';
import assert from 'node:assert/strict';
import { combineWithCategory } from '../src/utils/acompanhamentos.js';
import { mapCategoryFromApi } from '../src/services/api.js';

test('product gets category base items plus its own, without repeating', () => {
  const category = { ings: ['Alface', 'Tomate'], extras: [['Bacon', 5], ['Ovo', 3]] };
  const product = { id: 1, ings: ['tomate', 'Coração'], extras: [['Coração extra', 7], ['bacon', 6]] };
  const merged = combineWithCategory(category, product);
  assert.deepEqual(merged.ings, ['Alface', 'Tomate', 'Coração']);
  assert.deepEqual(merged.extras, [['bacon', 6], ['Ovo', 3], ['Coração extra', 7]]);
  assert.equal(merged.id, 1);
});

test('product without category keeps its own items', () => {
  const product = { ings: ['Queijo'], extras: [['Cheddar', 4]] };
  assert.deepEqual(combineWithCategory(undefined, product), { ...product, options: [] });
});

test('category mapping reads base items and old categories without them', () => {
  assert.deepEqual(mapCategoryFromApi({ id: 1, nome: 'Xis', ativo: true, ordem: 1, ingredientes: ['Alface'], adicionais: [{ nome: 'Bacon', preco: 5 }] }).extras, [['Bacon', 5]]);
  const old = mapCategoryFromApi({ id: 2, nome: 'Bebidas', ativo: true, ordem: 2 });
  assert.deepEqual([old.ings, old.extras], [[], []]);
});

test('drink category offers only options, merged from category and product', () => {
  const merged = combineWithCategory(
    { type: 'BEBIDA', options: ['Coca-Cola', 'Guaraná'], ings: ['Gelo'], extras: [['Limão', 1]] },
    { id: 2, options: ['guaraná', 'Fanta'], ings: ['Canudo'], extras: [['Copo', 1]] },
  );
  assert.deepEqual(merged.options, ['Coca-Cola', 'Guaraná', 'Fanta']);
  assert.deepEqual([merged.ings, merged.extras], [[], []]);
});

test('food category has no options and old categories default to food', () => {
  assert.deepEqual(combineWithCategory({ ings: [], extras: [] }, { options: ['Coca-Cola'], ings: [], extras: [] }).options, []);
  assert.equal(mapCategoryFromApi({ id: 1, nome: 'Xis', ativo: true, ordem: 1 }).type, 'ALIMENTO');
});
