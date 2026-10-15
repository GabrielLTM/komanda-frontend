import React, { useState } from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';

export default function EstoqueAdmin({ inventory, setInventory }) {
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low'
  const [stepTxt, setStepTxt] = useState({});

  const lowCount = inventory.filter((i) => i.current <= i.min).length;
  const filteredRows = inventory.filter((i) => stockFilter === 'all' || i.current <= i.min);

  const formatQuantity = (val, unit) => {
    return unit === 'kg' ? val.toFixed(1).replace('.', ',') + ' ' + unit : Math.round(val) + ' ' + unit;
  };

  const adjustStock = (id, delta) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, current: Math.max(0, Math.round((i.current + delta) * 10) / 10) } : i
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Estoque</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A7068' }}>
            {lowCount > 0 && <AlertCircle size={14} color="#C41F27" />}
            <span>{lowCount} insumos abaixo do mínimo</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', name: 'Todos' },
            { id: 'low', name: `Repor (${lowCount})` },
          ].map((f) => {
            const isSelected = stockFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                style={{
                  border: isSelected ? '1px solid #1F1A17' : '1px solid #E2DBD3',
                  background: isSelected ? '#1F1A17' : '#fff',
                  color: isSelected ? '#fff' : '#1F1A17',
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(90px, 160px) 70px 64px 128px', gap: '16px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          <span>Insumo</span>
          <span>Saldo</span>
          <span>Mínimo</span>
          <span>Status</span>
          <span>Ajustar</span>
        </div>

        {filteredRows.map((i) => {
          const isLow = i.current <= i.min;
          const defaultStep = i.unit === 'kg' ? '0,5' : '1';
          const currentStepStr = stepTxt[i.id] ?? defaultStep;
          const stepVal = Math.max(0, parseFloat(String(currentStepStr).replace(',', '.')) || 0);
          const percent = Math.min(100, Math.round((i.current / (i.min * 2.5)) * 100)) + '%';

          return (
            <div
              key={i.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 1fr) minmax(90px, 160px) 70px 64px 128px',
                gap: '16px',
                padding: '12px 18px',
                borderTop: '1px solid #F1ECE6',
                alignItems: 'center',
              }}
            >
              <strong style={{ fontSize: '14px', fontWeight: 600, minWidth: 0, overflowWrap: 'anywhere' }}>
                {i.name}
              </strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatQuantity(i.current, i.unit)}
                </span>
                <div style={{ height: '6px', borderRadius: '999px', background: '#F1ECE6', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: percent,
                      background: isLow ? '#C41F27' : '#2F9E44',
                      borderRadius: '999px',
                    }}
                  ></div>
                </div>
              </div>

              <span style={{ fontSize: '13px', color: '#6E655E', whiteSpace: 'nowrap' }}>
                {formatQuantity(i.min, i.unit)}
              </span>

              <span
                style={{
                  justifySelf: 'start',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  background: isLow ? '#FDECEC' : '#EAF6EC',
                  color: isLow ? '#C41F27' : '#237A33',
                }}
              >
                {isLow ? 'Repor' : 'OK'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2DBD3', borderRadius: '8px', justifySelf: 'start' }}>
                <button
                  onClick={() => adjustStock(i.id, -stepVal)}
                  style={{ border: 0, background: 'none', width: '30px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '2px', borderLeft: '1px solid #E2DBD3', borderRight: '1px solid #E2DBD3', padding: '0 6px', height: '32px', cursor: 'text' }}>
                  <input
                    value={currentStepStr}
                    onChange={(e) =>
                      setStepTxt({ ...stepTxt, [i.id]: e.target.value.replace(/[^0-9.,]/g, '') })
                    }
                    onFocus={(e) => e.target.select()}
                    inputMode="decimal"
                    style={{ width: '34px', border: 0, outline: 'none', background: 'transparent', textAlign: 'right', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: '#1F1A17', padding: 0 }}
                  />
                  <span style={{ fontSize: '12px', color: '#7A7068' }}>{i.unit}</span>
                </label>
                <button
                  onClick={() => adjustStock(i.id, stepVal)}
                  style={{ border: 0, background: 'none', width: '30px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
