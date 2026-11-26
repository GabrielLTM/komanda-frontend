import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenarPorPrazo, situacaoDoPrazo } from '../src/utils/prazo.js';

const criadoEm = '2026-11-25T22:00:00.000Z';
const base = Date.parse(criadoEm);
const min = (m) => base + m * 60_000;
const pedido = { status: 'prod', createdAt: criadoEm };

test('pedido dentro do prazo fica normal', () => {
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(5)), { estado: 'ok', minutos: 35 });
});

test('no último terço do prazo fica perto do prazo (prazo 40 → aviso com 13min20s)', () => {
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(26)), { estado: 'ok', minutos: 14 });
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(27)), { estado: 'perto', minutos: 13 });
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(30)), { estado: 'perto', minutos: 10 });
  assert.deepEqual(situacaoDoPrazo({ ...pedido, status: 'ready' }, '40', min(39.5)), { estado: 'perto', minutos: 1 });
});

test('passou do prazo fica atrasado', () => {
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(40)), { estado: 'atrasado', minutos: 0 });
  assert.deepEqual(situacaoDoPrazo(pedido, '40', min(52)), { estado: 'atrasado', minutos: 12 });
});

test('usa o prazo gravado no pedido, não o tempo atual da tela', () => {
  const pedido30 = { ...pedido, deadlineMinutes: 30 };
  // Tempo da tela mudou para 60, mas o pedido foi criado com 30.
  assert.deepEqual(situacaoDoPrazo(pedido30, '60', min(25)), { estado: 'perto', minutos: 5 });
  assert.deepEqual(situacaoDoPrazo(pedido30, '60', min(31)), { estado: 'atrasado', minutos: 1 });
});

test('pedido concluído, sem data ou sem prazo não tem situação', () => {
  assert.equal(situacaoDoPrazo({ ...pedido, status: 'done' }, '40', min(90)), null);
  assert.equal(situacaoDoPrazo({ status: 'prod' }, '40', min(1)), null);
  assert.equal(situacaoDoPrazo(pedido, '', min(1)), null);
  assert.equal(situacaoDoPrazo(pedido, '0', min(1)), null);
});

test('ordena pelo menor tempo até o prazo e, no empate, pela entrada', () => {
  const p = (num, minutosAtras, prazo, status = 'prod') => ({
    num, status, deadlineMinutes: prazo, createdAt: new Date(base - minutosAtras * 60_000).toISOString(),
  });
  const pedidos = [
    p(1, 0, 60),          // faltam 60
    p(2, 10, 30),         // faltam 20
    p(3, 50, 40),         // atrasado 10
    p(4, 0, 20),          // faltam 20 (empata com o 2; entrou depois)
    p(5, 0, 40, 'done'),  // concluído: sem prazo, vai para o fim
    p(6, 45, 40),         // atrasado 5
  ];
  assert.deepEqual(ordenarPorPrazo(pedidos, '40', base).map((x) => x.num), [3, 6, 2, 4, 1, 5]);
});

test('aviso proporcional: 1/3 do prazo, com no mínimo 10 minutos', () => {
  const comPrazo = (m) => ({ ...pedido, deadlineMinutes: m });
  // Prazo 60 → aviso com 20 min restantes
  assert.equal(situacaoDoPrazo(comPrazo(60), '40', min(39)).estado, 'ok');
  assert.equal(situacaoDoPrazo(comPrazo(60), '40', min(40)).estado, 'perto');
  // Prazo 15 → 1/3 seria 5, mas o mínimo é 10 → aviso com 10 min restantes
  assert.equal(situacaoDoPrazo(comPrazo(15), '40', min(4)).estado, 'ok');
  assert.equal(situacaoDoPrazo(comPrazo(15), '40', min(5)).estado, 'perto');
});
