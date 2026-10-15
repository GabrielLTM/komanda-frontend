import React, { useState } from 'react';
import { formatMoney } from '../utils/format';

export default function CaixaRelatorios({ orders }) {
  const [period, setPeriod] = useState('hoje'); // 'hoje' | 'ontem' | '7dias'

  const multiplier = { hoje: 1, ontem: 0.86, '7dias': 6.3 }[period];
  const revenue = orders.reduce((sum, o) => sum + o.total, 0) * multiplier;
  const count = Math.round(orders.length * multiplier);
  const avgTicket = count ? revenue / count : 0;

  // Fiado a receber
  const fiadoReceivable = orders
    .filter((o) => o.pay === 'Fiado' && !o.fiadoPaid)
    .reduce((sum, o) => sum + o.total, 0);

  // Top item
  const itemTally = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const match = it.t.match(/^(\d+)x (.+)$/);
      if (match) {
        itemTally[match[2]] = (itemTally[match[2]] || 0) + Number(match[1]);
      }
    });
  });
  const sortedItems = Object.entries(itemTally).sort((a, b) => b[1] - a[1]);
  const topItem = sortedItems[0] || ['—', 0];

  // Payments tally
  const payTally = {};
  orders.forEach((o) => {
    payTally[o.pay] = (payTally[o.pay] || 0) + o.total;
  });
  const totalPaySum = Object.values(payTally).reduce((a, b) => a + b, 0) || 1;

  // Insumos consumption
  const inventoryUsage = [
    { name: 'Pão de Xis', out: '4 un', left: 'resta 38 un' },
    { name: 'Hambúrguer bovino', out: '0,8 kg', left: 'resta 7,4 kg' },
    { name: 'Pão de cachorro-quente', out: '2 un', left: 'resta 40 un' },
    { name: 'Salsicha', out: '0,4 kg', left: 'resta 4,2 kg' },
    { name: 'Coração de frango', out: '0,2 kg', left: 'resta 2,1 kg' },
    { name: 'Batata congelada', out: '0,5 kg', left: 'resta 12 kg' },
    { name: 'Refrigerante lata', out: '3 un', left: 'resta 52 un' },
  ];

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

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Faturamento', value: formatMoney(revenue) },
          { label: 'Pedidos', value: String(count) },
          { label: 'Ticket médio', value: formatMoney(avgTicket) },
          { label: 'Fiado a receber', value: formatMoney(fiadoReceivable) },
          { label: 'Mais vendido', value: `${topItem[0]} (${Math.round(topItem[1] * multiplier)})` },
        ].map((k, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7A7068' }}>{k.label}</span>
            <strong style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.15 }}>{k.value}</strong>
          </div>
        ))}
      </div>

      {/* 2 Columns: Payment Methods & Inventory Consumption */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', alignItems: 'start' }}>
        {/* Payment Methods */}
        <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <strong style={{ fontSize: '15px' }}>Formas de pagamento</strong>
          {['PIX', 'Crédito', 'Débito', 'Dinheiro', 'Fiado'].map((p) => {
            const val = (payTally[p] || 0) * multiplier;
            const share = Math.round(((payTally[p] || 0) / totalPaySum) * 100) + '%';

            return (
              <div key={p} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{p}</span>
                  <span style={{ color: '#6E655E' }}>{formatMoney(val)} · {share}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#F1ECE6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: share, background: '#C41F27', borderRadius: '999px' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insumos usage */}
        <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong style={{ fontSize: '15px', marginBottom: '4px' }}>Saída de insumos</strong>
          <span style={{ fontSize: '12px', color: '#7A7068', marginBottom: '6px' }}>
            Baixa automática pelos pedidos fechados
          </span>
          {inventoryUsage.map((u, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', padding: '7px 0', borderTop: '1px solid #F4F0EB', fontSize: '13px' }}>
              <span style={{ flex: 1, minWidth: 0 }}>{u.name}</span>
              <strong style={{ color: '#C41F27', whiteSpace: 'nowrap' }}>−{u.out}</strong>
              <span style={{ color: '#7A7068', minWidth: '90px', textAlign: 'right', whiteSpace: 'nowrap' }}>{u.left}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extrato de Pedidos Table */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px' }}>
          <strong style={{ fontSize: '15px' }}>Extrato de pedidos</strong>
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
      </div>
    </div>
  );
}
