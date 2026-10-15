import React, { useState } from 'react';
import { X, Printer, Sliders } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function OrderDetailModal({
  order,
  motoboys,
  onClose,
  onUpdateOrder,
  onPrintToast,
}) {
  const [advSettings, setAdvSettings] = useState(false);
  const [obs, setObs] = useState('');
  const [printCfg, setPrintCfg] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('maumau-print-cfg'));
      if (saved && saved.cliente) return saved.cliente;
    } catch (e) {}
    return {
      paper: '80',
      size: 13,
      bold: true,
      footer: 'Obrigado pela preferência!',
      show: {
        loja: true,
        endereco: true,
        datahora: true,
        tipo: true,
        cliente: true,
        precos: true,
        mods: true,
        totais: true,
        pagamento: true,
        motoboy: true,
        rodape: true,
      },
    };
  });

  if (!order) return null;

  const isDelivery = order.type === 'delivery';
  const deliveryFee = isDelivery ? 5 : 0; // standard fallback
  const subtotal = order.total - (isDelivery ? (order.fee || 0) : 0);
  const changeValue =
    order.pay === 'Dinheiro' && Number(order.cash) > order.total
      ? Number(order.cash) - order.total
      : null;

  const updateCfg = (newCfg) => {
    setPrintCfg(newCfg);
    try {
      localStorage.setItem('maumau-print-cfg', JSON.stringify({ cliente: newCfg }));
    } catch (e) {}
  };

  const handlePrint = () => {
    onPrintToast('Comanda enviada para a impressora');
    // Also support browser print preview
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const moto = motoboys.find((m) => m.id === order.moto);
  const fs = printCfg.size;
  const paperWidth = printCfg.paper === '58' ? '240px' : '310px';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31,26,23,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1060px',
          height: 'min(90vh, 820px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 0.75fr) minmax(0, 1.25fr)',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        }}
      >
        {/* LEFT PANEL: Order Info & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid #F1ECE6' }}>
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1ECE6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '20px', fontWeight: 800 }}>Pedido #{order.num}</strong>
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#7A7068', fontWeight: 600 }}>
                {order.time}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, borderRadius: '6px', padding: '4px 8px', background: '#FDECEC', color: '#C41F27' }}>
                {isDelivery ? `Entrega · ${order.bairro || ''}` : 'Balcão'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, borderRadius: '6px', padding: '4px 8px', background: '#F4F0EB', color: '#4A423C' }}>
                {order.status === 'prod' ? 'Em Produção' : order.status === 'ready' ? 'Pronto' : 'Concluído'}
              </span>
            </div>
          </div>

          {/* Scrollable details */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Status change buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Alterar Status
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'prod', label: 'Produção' },
                  { id: 'ready', label: 'Pronto' },
                  { id: 'done', label: 'Concluído' },
                ].map((st) => {
                  const isCurrent = order.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => onUpdateOrder(order.num, { status: st.id })}
                      style={{
                        border: isCurrent ? '1.5px solid #1F1A17' : '1.5px solid #E2DBD3',
                        background: isCurrent ? '#1F1A17' : '#fff',
                        color: isCurrent ? '#fff' : '#1F1A17',
                        borderRadius: '999px',
                        padding: '7px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>
                Itens do Pedido
              </span>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F4F0EB' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{it.t}</span>
                    {it.mod && (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#C41F27' }}>
                        {it.mod}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatMoney(it.v || 0)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6E655E', paddingTop: '8px' }}>
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6E655E' }}>
                <span>Entrega</span>
                <span>{formatMoney(order.fee || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, paddingTop: '4px' }}>
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>

            {/* Client address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Cliente &amp; Entrega
              </span>
              <span style={{ fontSize: '14px' }}>
                {isDelivery ? `${order.street || 'Rua não informada'} · ${order.bairro || ''}` : 'Retirada no balcão'}
              </span>
              <span style={{ fontSize: '14px', color: '#4A423C' }}>
                {order.phone || 'Telefone não informado'}
              </span>
            </div>

            {/* Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Pagamento
              </span>
              <span style={{ fontSize: '14px' }}>
                {order.pay === 'Fiado'
                  ? `Fiado · ${order.fiadoName || 'sem nome'} · ${order.fiadoPaid ? 'pago' : 'a receber'}`
                  : `${order.pay}${changeValue != null ? ` · troco ${formatMoney(changeValue)}` : ''}`}
              </span>
              {order.pay === 'Fiado' && (
                <button
                  onClick={() => onUpdateOrder(order.num, { fiadoPaid: !order.fiadoPaid })}
                  style={{
                    alignSelf: 'flex-start',
                    border: order.fiadoPaid ? '1px solid #E2DBD3' : '0',
                    background: order.fiadoPaid ? '#fff' : '#2F9E44',
                    color: order.fiadoPaid ? '#4A423C' : '#fff',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {order.fiadoPaid ? 'Desfazer recebimento' : 'Marcar fiado como recebido'}
                </button>
              )}
            </div>

            {/* Motoboy */}
            {isDelivery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  Motoboy
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {motoboys.map((m) => {
                    const isSelected = order.moto === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onUpdateOrder(order.num, { moto: isSelected ? null : m.id })}
                        style={{
                          border: isSelected ? '1.5px solid #1F1A17' : '1.5px solid #E2DBD3',
                          background: isSelected ? '#1F1A17' : '#fff',
                          color: isSelected ? '#fff' : '#1F1A17',
                          borderRadius: '999px',
                          padding: '7px 14px',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Thermal Slip Live Preview & Adjustments */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#F4F0EB' }}>
          {/* Top Bar */}
          <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ECE6DF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong style={{ fontSize: '14px', fontWeight: 800 }}>Comanda impressa (Simulador)</strong>
            <button
              onClick={() => setAdvSettings(!advSettings)}
              style={{
                marginLeft: 'auto',
                border: '1px solid #E2DBD3',
                background: '#fff',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={13} />
              <span>{advSettings ? 'Fechar ajustes' : 'Ajustar impressão'}</span>
            </button>
            <button
              onClick={onClose}
              style={{ border: 0, background: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            {/* Settings drawer */}
            {advSettings && (
              <div style={{ width: '210px', flex: 'none', background: '#fff', borderRight: '1px solid #ECE6DF', overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Paper */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase' }}>Papel</span>
                  <div style={{ display: 'flex', background: '#F4F0EB', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                    {['58', '80'].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateCfg({ ...printCfg, paper: p })}
                        style={{
                          flex: 1,
                          border: 0,
                          borderRadius: '6px',
                          padding: '7px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: printCfg.paper === p ? '#fff' : 'transparent',
                          color: printCfg.paper === p ? '#1F1A17' : '#7A7068',
                        }}
                      >
                        {p} mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase' }}>Tamanho da fonte</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2DBD3', borderRadius: '8px' }}>
                    <button
                      onClick={() => updateCfg({ ...printCfg, size: Math.max(10, fs - 1) })}
                      style={{ border: 0, background: 'none', width: '40px', height: '36px', fontSize: '13px', fontWeight: 800 }}
                    >
                      A−
                    </button>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{fs} px</span>
                    <button
                      onClick={() => updateCfg({ ...printCfg, size: Math.min(22, fs + 1) })}
                      style={{ border: 0, background: 'none', width: '40px', height: '36px', fontSize: '16px', fontWeight: 800 }}
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', marginBottom: '6px' }}>Campos na comanda</span>
                  {[
                    ['loja', 'Nome da loja'],
                    ['endereco', 'Endereço da loja'],
                    ['datahora', 'Data e hora'],
                    ['tipo', 'Entrega ou balcão'],
                    ['cliente', 'Dados do cliente'],
                    ['precos', 'Preço dos itens'],
                    ['mods', 'Adicionais / remoções'],
                    ['totais', 'Subtotal e total'],
                    ['pagamento', 'Forma de pagamento'],
                    ['rodape', 'Mensagem de rodapé'],
                  ].map(([key, label]) => {
                    const isOn = printCfg.show[key];
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          updateCfg({
                            ...printCfg,
                            show: { ...printCfg.show, [key]: !isOn },
                          })
                        }
                        style={{
                          border: 0,
                          background: 'none',
                          padding: '6px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1F1A17',
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ width: '32px', height: '18px', borderRadius: '999px', background: isOn ? '#2F9E44' : '#D6CFC7', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '2px', left: isOn ? '16px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }}></span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer text input */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase' }}>
                  Mensagem de rodapé
                  <input
                    value={printCfg.footer}
                    onChange={(e) => updateCfg({ ...printCfg, footer: e.target.value })}
                    style={{ border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', textTransform: 'none', fontWeight: 500 }}
                  />
                </label>

                {/* Single print obs */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase' }}>
                  Observação (só nesta via)
                  <textarea
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    rows={2}
                    placeholder="Ex: Ponto da carne bem passado"
                    style={{ border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', textTransform: 'none', resize: 'vertical' }}
                  ></textarea>
                </label>
              </div>
            )}

            {/* Thermal Slip View */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '24px 12px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: paperWidth,
                  flex: 'none',
                  background: '#fff',
                  boxShadow: '0 2px 10px rgba(31,26,23,.12)',
                  padding: '28px 16px 48px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: `${fs}px`,
                  lineHeight: 1.6,
                  color: '#111',
                  boxSizing: 'border-box',
                }}
              >
                {printCfg.show.loja && (
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: `${fs + 8}px`, lineHeight: 1.15 }}>
                    MAU MAU LANCHES
                  </div>
                )}
                {printCfg.show.endereco && (
                  <div style={{ textAlign: 'center', fontSize: `${Math.max(9, fs - 2)}px`, marginTop: '8px' }}>
                    R. Vinte de Setembro, 1151
                    <br />
                    Parque 35 · Guaíba-RS
                  </div>
                )}
                <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: `${fs + 6}px`, lineHeight: 1.2 }}>
                  PEDIDO #{order.num}
                </div>
                {printCfg.show.datahora && (
                  <div style={{ textAlign: 'center', fontSize: `${Math.max(9, fs - 2)}px` }}>
                    {order.time}
                  </div>
                )}
                {printCfg.show.tipo && (
                  <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '8px', border: '1.5px solid #111', padding: '4px 0' }}>
                    {isDelivery ? 'ENTREGA' : 'BALCÃO'}
                  </div>
                )}
                {printCfg.show.cliente && isDelivery && (
                  <>
                    <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                    <div>{order.street || 'Rua não informada'}</div>
                    <div style={{ fontWeight: 700 }}>Bairro: {order.bairro}</div>
                    {order.phone && <div>Tel: {order.phone}</div>}
                  </>
                )}

                <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>

                {/* Items */}
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ minWidth: 0, fontWeight: printCfg.bold ? 700 : 400 }}>{it.t}</span>
                      {printCfg.show.precos && (
                        <span style={{ whiteSpace: 'nowrap', fontSize: `${Math.max(9, fs - 2)}px` }}>
                          {formatMoney(it.v || 0)}
                        </span>
                      )}
                    </div>
                    {printCfg.show.mods && it.mod && (
                      <div style={{ paddingLeft: '12px', fontSize: `${fs}px`, fontWeight: 600 }}>
                        &gt; {it.mod}
                      </div>
                    )}
                  </div>
                ))}

                {obs.trim() && (
                  <>
                    <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                    <div style={{ fontWeight: 700 }}>OBS: {obs.trim()}</div>
                  </>
                )}

                {printCfg.show.totais && (
                  <>
                    <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal</span>
                      <span>{formatMoney(subtotal)}</span>
                    </div>
                    {isDelivery && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Entrega</span>
                        <span>{formatMoney(order.fee || 0)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: `${fs + 3}px`, marginTop: '3px' }}>
                      <span>TOTAL</span>
                      <span>{formatMoney(order.total)}</span>
                    </div>
                  </>
                )}

                {printCfg.show.pagamento && (
                  <>
                    <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Pagamento</span>
                      <span style={{ fontWeight: 700 }}>{order.pay}</span>
                    </div>
                    {order.pay === 'Fiado' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Cliente</span>
                          <span style={{ fontWeight: 700 }}>{order.fiadoName || '—'}</span>
                        </div>
                        <div style={{ marginTop: '24px', borderTop: '1px solid #111' }}></div>
                        <div style={{ textAlign: 'center', fontSize: `${Math.max(9, fs - 2)}px` }}>Assinatura</div>
                      </>
                    )}
                    {changeValue != null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Troco</span>
                        <span style={{ fontWeight: 700 }}>{formatMoney(changeValue)}</span>
                      </div>
                    )}
                  </>
                )}

                {printCfg.show.rodape && printCfg.footer && (
                  <>
                    <div style={{ borderTop: '1px dashed #2A2420', margin: '14px 0' }}></div>
                    <div style={{ textAlign: 'center', fontSize: `${Math.max(9, fs - 2)}px` }}>
                      {printCfg.footer}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #ECE6DF', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                border: 0,
                background: '#C41F27',
                color: '#fff',
                borderRadius: '10px',
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              <span>Imprimir comanda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
