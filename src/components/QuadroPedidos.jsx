import React, { useState } from 'react';
import { Clock, Printer, ArrowRight, CheckCircle2, Bike } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function QuadroPedidos({
  orders,
  setOrders,
  motoboys,
  onOpenDetail,
}) {
  const [draggedOrderNum, setDraggedOrderNum] = useState(null);
  const [overColId, setOverColId] = useState(null);

  const COLUMNS = [
    { id: 'prod', name: 'Produção', dot: '#F5B800', tint: '#FFFBEE' },
    { id: 'ready', name: 'Pronto p/ retirada ou entrega', dot: '#C41F27', tint: '#FFF5F5' },
    { id: 'done', name: 'Concluído', dot: '#2F9E44', tint: '#F3FAF4' },
  ];

  const moveOrder = (num, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.num === num ? { ...o, status: newStatus } : o))
    );
    setDraggedOrderNum(null);
    setOverColId(null);
  };

  const handleSetMotoboy = (orderNum, motoId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.num === orderNum ? { ...o, moto: o.moto === motoId ? null : motoId } : o
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 'calc(100vh - 44px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Pedidos</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            Arraste o card para mudar o status ou use os botões rápidos
          </span>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', alignItems: 'stretch' }}>
        {COLUMNS.map((col, colIdx) => {
          const colOrders = orders.filter((o) => o.status === col.id);
          const isOver = overColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColId !== col.id) setOverColId(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOverColId(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const num = Number(e.dataTransfer.getData('text/plain')) || draggedOrderNum;
                if (num) moveOrder(num, col.id);
              }}
              style={{
                background: isOver ? col.tint : '#F1EDE8',
                border: isOver ? `2px dashed ${col.dot}` : '2px dashed transparent',
                borderRadius: '14px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minHeight: '400px',
                minWidth: 0,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px 4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.dot }}></span>
                <strong style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.25 }}>
                  {col.name}
                </strong>
                <span
                  style={{
                    marginLeft: 'auto',
                    background: '#fff',
                    border: '1px solid #ECE6DF',
                    borderRadius: '999px',
                    minWidth: '26px',
                    height: '22px',
                    padding: '0 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Cards in Column */}
              {colOrders.map((o) => {
                const isDelivery = o.type === 'delivery';
                const nextCol = COLUMNS[colIdx + 1];
                const needMoto = isDelivery && !o.moto && o.status !== 'done';
                const isBeingDragged = draggedOrderNum === o.num;

                return (
                  <div
                    key={o.num}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(o.num));
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedOrderNum(o.num);
                    }}
                    onDragEnd={() => {
                      setDraggedOrderNum(null);
                      setOverColId(null);
                    }}
                    onClick={() => onOpenDetail(o.num)}
                    style={{
                      background: '#fff',
                      border: '1px solid #ECE6DF',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer',
                      minWidth: 0,
                      opacity: isBeingDragged ? 0.4 : 1,
                      boxShadow: '0 1px 2px rgba(31,26,23,.05)',
                      transition: 'box-shadow 0.15s',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', fontWeight: 800 }}>#{o.num}</strong>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7A7068', fontWeight: 600 }}>
                          <Clock size={13} />
                          <span>{o.time}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          alignSelf: 'flex-start',
                          maxWidth: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '11px',
                          fontWeight: 800,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          background: isDelivery ? '#FDECEC' : '#F4F0EB',
                          color: isDelivery ? '#C41F27' : '#4A423C',
                        }}
                      >
                        {isDelivery ? `Entrega · ${o.bairro}` : 'Balcão'}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, overflowWrap: 'anywhere' }}>
                            {it.t}
                          </span>
                          {it.mod && (
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#C41F27' }}>
                              {it.mod}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Motoboy selector for deliveries */}
                    {isDelivery && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F4F0EB', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Bike size={13} color={needMoto ? '#C41F27' : '#7A7068'} />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: needMoto ? '#C41F27' : '#7A7068',
                              textTransform: 'uppercase',
                              letterSpacing: '.04em',
                            }}
                          >
                            {needMoto ? 'Escolher motoboy' : 'Motoboy'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {motoboys.map((m) => {
                            const isSelected = o.moto === m.id;
                            const firstName = m.name.split(' ')[0];
                            return (
                              <button
                                key={m.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetMotoboy(o.num, m.id);
                                }}
                                style={{
                                  border: isSelected ? '1.5px solid #1F1A17' : '1.5px solid #E2DBD3',
                                  background: isSelected ? '#1F1A17' : '#fff',
                                  color: isSelected ? '#fff' : '#1F1A17',
                                  borderRadius: '999px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                }}
                              >
                                {firstName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer / Total & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px', borderTop: '1px solid #F4F0EB', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                          {formatMoney(o.total)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#7A7068' }}>
                          {o.pay === 'Fiado' ? `Fiado · ${o.fiadoName || ''}${o.fiadoPaid ? ' (pago)' : ''}` : o.pay}
                        </span>
                      </div>

                      {/* Imprimir button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail(o.num);
                        }}
                        style={{
                          marginLeft: 'auto',
                          border: '1px solid #E2DBD3',
                          background: '#fff',
                          color: '#1F1A17',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Printer size={13} />
                        <span>Imprimir</span>
                      </button>

                      {/* Move to next status */}
                      {nextCol && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveOrder(o.num, nextCol.id);
                          }}
                          style={{
                            border: 0,
                            background: '#1F1A17',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {col.id === 'prod' ? (
                            <>
                              <span>Marcar pronto</span>
                              <ArrowRight size={13} />
                            </>
                          ) : (
                            <>
                              <span>Concluir</span>
                              <CheckCircle2 size={13} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {colOrders.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#9A9089', padding: '24px' }}>
                  Nenhum pedido
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
