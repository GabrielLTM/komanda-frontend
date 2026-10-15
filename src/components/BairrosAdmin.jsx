import React, { useState } from 'react';
import { Search, Plus, X, MapPin } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function BairrosAdmin({ bairros, setBairros }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('');
  const [triedAdd, setTriedAdd] = useState(false);
  const [feeInputs, setFeeInputs] = useState({});

  const q = searchTerm.trim().toLowerCase();

  const filteredBairros = bairros
    .filter((b) => !q || b.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  const activeFees = bairros.filter((b) => b.active).map((b) => b.fee);
  const feeRange = activeFees.length
    ? `${formatMoney(Math.min(...activeFees))} a ${formatMoney(Math.max(...activeFees))}`
    : '—';

  const isDuplicate = bairros.some(
    (b) => b.name.toLowerCase() === newName.trim().toLowerCase()
  );

  const handleAddBairro = () => {
    const feeVal = parseFloat(String(newFee).replace(',', '.'));
    if (!newName.trim() || isNaN(feeVal) || feeVal < 0 || isDuplicate) {
      setTriedAdd(true);
      return;
    }
    const id = Math.max(0, ...bairros.map((b) => b.id)) + 1;
    setBairros([...bairros, { id, name: newName.trim(), fee: feeVal, active: true }]);
    setNewName('');
    setNewFee('');
    setTriedAdd(false);
  };

  const handleUpdateName = (id, updatedName) => {
    setBairros((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: updatedName } : b))
    );
  };

  const handleUpdateFee = (id, updatedFeeStr) => {
    const feeVal = parseFloat(updatedFeeStr.replace(',', '.'));
    setFeeInputs({ ...feeInputs, [id]: updatedFeeStr });
    if (!isNaN(feeVal)) {
      setBairros((prev) =>
        prev.map((b) => (b.id === id ? { ...b, fee: feeVal } : b))
      );
    }
  };

  const handleToggleActive = (id) => {
    setBairros((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleDelete = (id) => {
    setBairros((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Bairros &amp; taxas de entrega</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            {bairros.filter((b) => b.active).length} bairros atendidos · taxas de {feeRange}
          </span>
        </div>
        <div style={{ position: 'relative', width: '220px', maxWidth: '100%' }}>
          <Search size={16} color="#9A9089" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar bairro"
            style={{ width: '100%', border: '1px solid #E2DBD3', background: '#fff', borderRadius: '10px', padding: '10px 14px 10px 36px', fontSize: '14px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Cadastrar Bairro */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>Cadastrar bairro</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setTriedAdd(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddBairro();
            }}
            placeholder="Nome do bairro"
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              border: triedAdd && (!newName.trim() || isDuplicate) ? '1px solid #C41F27' : '1px solid #E2DBD3',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: triedAdd && isNaN(parseFloat(newFee.replace(',', '.'))) ? '1px solid #C41F27' : '1px solid #E2DBD3', borderRadius: '8px', padding: '0 12px', width: '120px' }}>
            <span style={{ color: '#9A9089', fontSize: '14px' }}>R$</span>
            <input
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddBairro();
              }}
              placeholder="0,00"
              style={{ border: 0, outline: 'none', width: '100%', fontSize: '14px', fontWeight: 700, padding: '10px 0' }}
            />
          </div>
          <button
            onClick={handleAddBairro}
            style={{
              border: 0,
              background: '#C41F27',
              color: '#fff',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>
        {triedAdd && isDuplicate && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#C41F27' }}>
            Esse bairro já está cadastrado.
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 130px 70px 40px', gap: '14px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          <span>Bairro</span>
          <span>Taxa</span>
          <span>Ativo</span>
          <span></span>
        </div>

        {filteredBairros.map((b) => {
          const currentFeeDisplay = feeInputs[b.id] ?? b.fee.toFixed(2).replace('.', ',');

          return (
            <div
              key={b.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 1fr) 130px 70px 40px',
                gap: '14px',
                padding: '10px 18px',
                borderTop: '1px solid #F1ECE6',
                alignItems: 'center',
                opacity: b.active ? 1 : 0.55,
              }}
            >
              <input
                value={b.name}
                onChange={(e) => handleUpdateName(b.id, e.target.value)}
                style={{
                  minWidth: 0,
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '7px 8px',
                  marginLeft: '-8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'transparent',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E2DBD3', borderRadius: '8px', padding: '0 10px', height: '36px' }}>
                <span style={{ color: '#9A9089', fontSize: '13px' }}>R$</span>
                <input
                  value={currentFeeDisplay}
                  onChange={(e) => handleUpdateFee(b.id, e.target.value)}
                  style={{ border: 0, outline: 'none', width: '100%', fontSize: '14px', fontWeight: 700, background: 'transparent' }}
                />
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggleActive(b.id)}
                style={{
                  border: 0,
                  width: '46px',
                  height: '26px',
                  borderRadius: '999px',
                  background: b.active ? '#2F9E44' : '#D6CFC7',
                  position: 'relative',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: b.active ? '23px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.15s',
                  }}
                ></span>
              </button>

              <button
                onClick={() => handleDelete(b.id)}
                title="Remover bairro"
                style={{ border: 0, background: 'none', width: '32px', height: '32px', borderRadius: '8px', fontSize: '18px', color: '#9A9089', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}

        {filteredBairros.length === 0 && (
          <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089', borderTop: '1px solid #F1ECE6' }}>
            Nenhum bairro encontrado.
          </p>
        )}
      </div>

      <span style={{ fontSize: '12px', color: '#7A7068' }}>
        Bairros desativados não aparecem na tela de pedido. A taxa é somada automaticamente ao total e ao acerto do motoboy.
      </span>
    </div>
  );
}
