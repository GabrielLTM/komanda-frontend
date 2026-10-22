import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, mapMotoboyFromApi, mapNeighborhoodFromApi, mapProductFromApi, productToApi } from '../src/services/api.js';

const jsonResponse = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('product mapping translates catalog fields and preserves empty arrays, false, zero, and empty description', () => {
  const payload = productToApi({ name: ' X ', catId: 7, price: 0, desc: '  ', active: false, ings: [], extras: [] });
  assert.deepEqual(payload, { nome: ' X ', categoriaId: 7, preco: 0, descricao: null, ativo: false, ingredientes: [], adicionais: [] });
  assert.deepEqual(productToApi({ price: undefined }), {});
  assert.equal(mapProductFromApi({ id: 4, categoria: { id: 7 }, nome: 'X', preco: 0, descricao: null, ativo: false, ingredientes: [], adicionais: [] }).price, 0);
  assert.deepEqual(mapProductFromApi({ id: 4, categoria: { id: 7 }, nome: 'X', preco: 2, ativo: true, ingredientes: ['cebola'], adicionais: [{ nome: 'Queijo', preco: 0 }] }).extras, [['Queijo', 0]]);
});

test('default relative base keeps /api in requests and PATCH leaves absent price out', async () => {
  const calls = [];
  const api = createApi({ fetchImpl: async (url, init = {}) => { calls.push({ url, init }); return jsonResponse({ id: 4, categoria: { id: 7 }, nome: 'X', preco: 5, descricao: null, ativo: true, ingredientes: [], adicionais: [] }); } });
  await api.updateProduto(4, { active: false, ings: [] });
  assert.equal(calls[0].url, 'http://localhost/api/produtos/4');
  assert.deepEqual(JSON.parse(calls[0].init.body), { ativo: false, ingredientes: [] });
});

test('absolute API base keeps its /api prefix and health probes backend origin', async () => {
  const calls = [];
  const api = createApi({ baseUrl: 'https://backend.example/api', fetchImpl: async (url) => { calls.push(url); return jsonResponse([{ id: 1, nome: 'Lanches', ativo: true, ordem: 0 }]); } });
  await api.getCategorias();
  await api.health();
  assert.equal(calls[0], 'https://backend.example/api/categorias');
  assert.equal(calls[1], 'https://backend.example/health');
});

test('neighborhood and courier mappings preserve zero amounts and active state', () => {
  assert.deepEqual(mapNeighborhoodFromApi({ id: 2, nome: 'Centro', taxaEntrega: 0, ativo: true }), { id: 2, name: 'Centro', fee: 0, active: true });
  assert.deepEqual(mapMotoboyFromApi({ id: 3, nome: 'Ana', telefone: '', valorFixoNoite: 0, ativo: false }), { id: 3, name: 'Ana', phone: '', baseFee: 0, active: false });
});

test('HTTP errors use the Portuguese backend message and DELETE 204 is accepted', async () => {
  const apiError = createApi({ fetchImpl: async () => jsonResponse({ erro: 'Nome já cadastrado.' }, 409) });
  await assert.rejects(apiError.createCategoria({ name: 'Lanches' }), /Nome já cadastrado/);
  const apiDelete = createApi({ fetchImpl: async () => ({ ok: true, status: 204, json: async () => null }) });
  assert.equal(await apiDelete.deleteBairro(8), null);
});
