// Situação do pedido em relação ao prazo de entrega.
// O prazo é o tempo de espera gravado no pedido quando ele foi criado (deadlineMinutes),
// contado a partir da criação. Pedidos antigos, sem prazo gravado, usam o tempo atual da tela.
// Fica "perto do prazo" no último terço do prazo, com no mínimo 10 minutos de aviso.
// Ex.: prazo 30 → aviso aos 10 min restantes; 45 → 15; 60 → 20.
export const AVISO_MINIMO_MINUTOS = 10;
export const AVISO_FRACAO_DO_PRAZO = 1 / 3;

export function minutosDeAviso(prazoMin) {
  return Math.max(AVISO_MINIMO_MINUTOS, prazoMin * AVISO_FRACAO_DO_PRAZO);
}

// Ordem do quadro: primeiro quem tem menos tempo até o prazo (os atrasados, mais atrasados
// primeiro); pedidos sem prazo (concluídos) ficam depois. Empate: ordem de entrada (número).
export function ordenarPorPrazo(pedidos, tempoDeEspera, agora = Date.now()) {
  const restante = (pedido) => {
    if (!situacaoDoPrazo(pedido, tempoDeEspera, agora)) return Infinity;
    const prazoMin = pedido.deadlineMinutes ?? Number(String(tempoDeEspera ?? '').replace(',', '.'));
    return Date.parse(pedido.createdAt) + prazoMin * 60_000 - agora;
  };
  return pedidos
    .map((pedido) => ({ pedido, restante: restante(pedido) }))
    .sort((a, b) => (a.restante === b.restante ? 0 : a.restante < b.restante ? -1 : 1) || a.pedido.num - b.pedido.num)
    .map(({ pedido }) => pedido);
}

// Devolve null para pedido concluído, sem data ou sem prazo válido.
// Caso contrário: { estado: 'ok' | 'perto' | 'atrasado', minutos }, onde minutos é
// quanto falta (ok/perto) ou há quanto tempo passou do prazo (atrasado).
export function situacaoDoPrazo(pedido, tempoDeEspera, agora = Date.now()) {
  if (!pedido || pedido.status === 'done' || pedido.status === 'canceled') return null;
  const prazoMin = pedido.deadlineMinutes ?? Number(String(tempoDeEspera ?? '').replace(',', '.'));
  const criado = Date.parse(pedido.createdAt);
  if (!Number.isFinite(prazoMin) || prazoMin <= 0 || !Number.isFinite(criado)) return null;

  const restanteMs = criado + prazoMin * 60_000 - agora;
  if (restanteMs <= 0) return { estado: 'atrasado', minutos: Math.floor(Math.abs(restanteMs) / 60_000) };
  const minutos = Math.ceil(restanteMs / 60_000);
  return { estado: restanteMs <= minutosDeAviso(prazoMin) * 60_000 ? 'perto' : 'ok', minutos };
}
