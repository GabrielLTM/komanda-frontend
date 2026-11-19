import React, { useEffect, useState } from 'react';
import { formatMoney } from '../utils/format';
import { api } from '../services/api';

// Desloca uma noite AAAA-MM-DD em dias, sem depender do fuso do navegador.
const shiftNight = (night, days) => {
  const d = new Date(`${night}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function CaixaRelatorios({ orders }) {
  const [period, setPeriod] = useState('hoje'); // 'hoje' | 'ontem' | '7dias'
  const [tonight, setTonight] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [closing, setClosing] = useState(null);
  const [error, setError] = useState('');

  // Métricas e fechamento vêm da API: só pedidos entregues, sem o fiado.
  useEffect(() => {
    let cancelled = false;
    setError('');
    (async () => {
      try {
        const night = tonight ?? (await api.getMetricas()).end;
        const range = {
          hoje: { inicio: night, fim: night },
          ontem: { inicio: shiftNight(night, -1), fim: shiftNight(night, -1) },
          '7dias': { inicio: shiftNight(night, -6), fim: night },
        }[period];
        const [m, c] = await Promise.all([
          api.getMetricas(range),
          period === '7dias' ? null : api.getFechamento(range.inicio),
        ]);
        if (cancelled) return;
        setTonight(night);
        setMetrics(m);
        setClosing(c);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Não foi possível carregar o caixa.');
      }
    })();
    return () => { cancelled = true; };
  }, [period, tonight, orders]);

  const paymentSum = metrics ? metrics.byPayment.reduce((sum, p) => sum + p.total, 0) || 1 : 1;
  const card = { background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Period Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Caixa &amp; Relatórios</h1>
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #ECE6DF', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'ontem', label: 'Ontem' },
            { id: '7dias', label: '7 dias' },
          ].map((p) => {
            const isSelected = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                style={{
                  border: 0,
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: isSelected ? '#1F1A17' : 'transparent',
                  color: isSelected ? '#fff' : '#6E655E',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div role="alert" style={{ background: '#FFF0F0', color: '#8C141B', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '12px 14px' }}>{error}</div>}
      {!metrics && !error && <div role="status" style={{ color: '#4A423C' }}>Carregando caixa…</div>}

      {metrics && <>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Faturamento', value: formatMoney(metrics.revenue) },
          { label: 'Pedidos entregues', value: String(metrics.orders) },
          { label: 'Ticket médio', value: formatMoney(metrics.avgTicket) },
          { label: 'Mais vendido', value: metrics.topProduct ? `${metrics.topProduct.nome} (${metrics.topProduct.quantidade})` : '—' },
          { label: 'Categoria mais vendida', value: metrics.topCategory ? metrics.topCategory.nome : '—' },
        ].map((k, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7A7068' }}>{k.label}</span>
            <strong style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.15 }}>{k.value}</strong>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', alignItems: 'start' }}>
        {/* Payment Methods */}
        <div style={card}>
          <strong style={{ fontSize: '15px' }}>Formas de pagamento</strong>
          {metrics.byPayment.map((p) => {
            const share = Math.round((p.total / paymentSum) * 100) + '%';

            return (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: '#6E655E' }}>{formatMoney(p.total)} · {share}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#F1ECE6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: share, background: '#C41F27', borderRadius: '999px' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fechamento da noite e acerto dos motoboys */}
        {closing && (
          <div style={card}>
            <strong style={{ fontSize: '15px' }}>Fechamento da noite</strong>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Taxas de entrega arrecadadas</span>
              <strong>{formatMoney(closing.deliveryFees)}</strong>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>Acerto dos motoboys</span>
            {closing.motoboys.length === 0 && <span style={{ fontSize: '13px', color: '#7A7068' }}>Nenhuma entrega concluída nesta noite.</span>}
            {closing.motoboys.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px', borderTop: '1px solid #F4F0EB', paddingTop: '8px' }}>
                <span>{m.name} · {m.deliveries} {m.deliveries === 1 ? 'entrega' : 'entregas'}</span>
                <span style={{ color: '#6E655E' }}>{formatMoney(m.baseFee)} + {formatMoney(m.fees)} = <strong style={{ color: '#1F1A17' }}>{formatMoney(m.total)}</strong></span>
              </div>
            ))}
          </div>
        )}
      </div>
      </>}

      {/* Extrato de Pedidos Table: só a noite atual, que é a que a tela carrega */}
      {period === 'hoje' && <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px' }}>
          <strong style={{ fontSize: '15px' }}>Extrato de pedidos desta noite</strong>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '640px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 60px 150px minmax(0, 1fr) 80px 90px', gap: '12px', padding: '10px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <span>#</span>
              <span>Hora</span>
              <span>Tipo</span>
              <span>Itens</span>
              <span>Pgto</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>
            {[...orders].reverse().map((o) => (
              <div key={o.num} style={{ display: 'grid', gridTemplateColumns: '60px 60px 150px minmax(0, 1fr) 80px 90px', gap: '12px', padding: '11px 18px', borderTop: '1px solid #F1ECE6', fontSize: '13px', alignItems: 'center' }}>
                <strong>#{o.num}</strong>
                <span style={{ color: '#7A7068' }}>{o.time}</span>
                <span>{o.type === 'delivery' ? `Entrega · ${o.bairro}` : 'Balcão'}</span>
                <span style={{ color: '#4A423C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {o.items.map((i) => i.t).join(', ')}
                </span>
                <span style={{ color: '#7A7068' }}>
                  {o.pay === 'Fiado' ? `Fiado${o.fiadoPaid ? ' ✓' : ''}` : o.pay}
                </span>
                <strong style={{ textAlign: 'right' }}>{formatMoney(o.total)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}
