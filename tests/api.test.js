import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, mapMotoboyFromApi, mapNeighborhoodFromApi, mapOrderFromApi, mapProductFromApi, orderStatusToApi, orderToApi, productToApi } from '../src/services/api.js';

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

test('order payload follows the API contract for pickup and delivery', () => {
  const cart = [{ productId: 1, qty: 2, removed: ['Tomate'], added: ['Bacon'] }];
  assert.deepEqual(
    orderToApi({ type: 'balcao', clientName: ' Ana ', phone: '(51) 9999', bairroId: '3', street: 'Rua A', cart, paymentMethod: 'Crédito', cashGiven: '' }),
    { tipo: 'RETIRADA', nomeCliente: 'Ana', telefone: null, bairroId: null, endereco: null, itens: [{ produtoId: 1, quantidade: 2, ingredientesRetirados: ['Tomate'], adicionais: ['Bacon'] }], formaPagamento: 'CREDITO' },
  );
  const delivery = orderToApi({ type: 'delivery', clientName: 'Ana', phone: '', bairroId: '3', street: ' Rua A, 10 ', cart, paymentMethod: 'Dinheiro', cashGiven: '100' });
  assert.equal(delivery.tipo, 'ENTREGA');
  assert.equal(delivery.bairroId, 3);
  assert.equal(delivery.endereco, 'Rua A, 10');
  assert.equal(delivery.telefone, null);
  assert.equal(delivery.valorRecebido, 100);
});

test('order mapping translates API codes to screen labels', () => {
  const order = mapOrderFromApi({
    id: 9, numero: 4, criadoEm: '2026-11-19T22:03:44.675Z', tipo: 'ENTREGA', status: 'PRONTO', nomeCliente: 'Maria', telefone: null,
    bairro: { id: 1, nome: 'Centro' }, endereco: 'Rua A', taxaEntrega: 5, total: 77, formaPagamento: 'FIADO', valorRecebido: null, motoboy: { id: 2, nome: 'Cleber' },
    itens: [{ nome: 'Xis Salada', quantidade: 2, subtotal: 66, adicionais: [{ nome: 'Bacon', preco: 5 }], ingredientesRetirados: ['Tomate'] }],
  });
  assert.equal(order.num, 4);
  assert.equal(order.status, 'ready');
  assert.equal(order.type, 'delivery');
  assert.equal(order.pay, 'Fiado');
  assert.equal(order.fiadoName, 'Maria');
  assert.equal(order.moto, 2);
  assert.deepEqual(order.items, [{ t: '2x Xis Salada', mod: '+ bacon, sem tomate', v: 66 }]);
  assert.equal(orderStatusToApi('done'), 'ENTREGUE');
});
