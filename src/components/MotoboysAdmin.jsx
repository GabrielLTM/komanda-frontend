import React, { useState } from 'react';
import { Plus, X, Bike, Phone, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function MotoboysAdmin({
  motoboys,
  setMotoboys,
  orders,
  bairros,
}) {
  const [dailyFee, setDailyFee] = useState(40);
  const [dailyFeeInput, setDailyFeeInput] = useState('40,00');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [triedAdd, setTriedAdd] = useState(false);
  const [paidStatus, setPaidStatus] = useState({});

  const getBairroFee = (bairroName) => {
    const b = bairros.find((x) => x.name === bairroName);
    return b ? b.fee : 0;
  };

  const handleAddMotoboy = () => {
    if (!newName.trim()) {
      setTriedAdd(true);
      return;
    }
    const id = Math.max(0, ...motoboys.map((m) => m.id)) + 1;
    setMotoboys([...motoboys, { id, name: newName.trim(), phone: newPhone.trim() }]);
    setNewName('');
    setNewPhone('');
    setTriedAdd(false);
  };

  const handleRemoveMotoboy = (id) => {
    setMotoboys(motoboys.filter((m) => m.id !== id));
  };

  const togglePaid = (id) => {
    setPaidStatus({ ...paidStatus, [id]: !paidStatus[id] });
  };

  const statusLabel = { prod: 'Produção', ready: 'Aguardando', done: 'Entregue' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Motoboys</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            Acerto do dia: diária fixa + taxa dos bairros atendidos
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFF6DB', borderRadius: '10px', padding: '8px 8px 8px 14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#7A5A00' }}>Diária (todos)</span>
          <label title="Clique para editar" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1.5px solid #E9D18A', borderRadius: '8px', padding: '0 10px', height: '36px', cursor: 'text' }}>
            <span style={{ fontSize: '14px', color: '#7A7068' }}>R$</span>
            <input
              value={dailyFeeInput}
              onChange={(e) => {
                const val = e.target.value;
                setDailyFeeInput(val);
                const parsed = parseFloat(val.replace(',', '.'));
                if (!isNaN(parsed)) setDailyFee(parsed);
              }}
              onFocus={(e) => e.target.select()}
              style={{ width: '56px', border: 0, outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '16px', fontWeight: 800, color: '#1F1A17', padding: 0 }}
            />
          </label>
        </div>
      </div>

      {/* Cadastrar Motoboy */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>Cadastrar motoboy</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setTriedAdd(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddMotoboy();
            }}
            placeholder="Nome completo"
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              border: triedAdd && !newName.trim() ? '1px solid #C41F27' : '1px solid #E2DBD3',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddMotoboy();
            }}
            placeholder="Telefone (opcional)"
            style={{ flex: '0 1 180px', minWidth: 0, border: '1px solid #E2DBD3', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
          />
          <button
            onClick={handleAddMotoboy}
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
      </div>

      {/* Cards de Motoboys */}
      {motoboys.length === 0 && (
        <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089' }}>
          Nenhum motoboy cadastrado.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {motoboys.map((m) => {
          const trips = orders.filter((o) => o.moto === m.id && o.type === 'delivery');
          const totalFees = trips.reduce((acc, o) => acc + getBairroFee(o.bairro), 0);
          const totalPay = dailyFee + totalFees;
          const isPaid = !!paidStatus[m.id];
          const initials = m.name
            .split(' ')
            .map((x) => x[0])
            .join('');

          return (
            <div key={m.id} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', display: 'flex', flexDirection: 'column' }}>
              {/* Card Header */}
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #F1ECE6' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF6DB', color: '#7A5A00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>
                  {initials}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '15px' }}>{m.name}</strong>
                  {m.phone && (
                    <span style={{ fontSize: '12px', color: '#7A7068', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} /> {m.phone}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    background: isPaid ? '#EAF6EC' : '#FFF6DB',
                    color: isPaid ? '#237A33' : '#7A5A00',
                  }}
                >
                  {isPaid ? 'Pago' : 'Em aberto'}
                </span>
                <button
                  onClick={() => handleRemoveMotoboy(m.id)}
                  title="Remover motoboy"
                  style={{ border: 0, background: 'none', width: '30px', height: '30px', borderRadius: '8px', fontSize: '18px', color: '#9A9089', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Trips List */}
              <div style={{ padding: '8px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {trips.map((t) => (
                  <div key={t.num} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F4F0EB', fontSize: '13px' }}>
                    <strong style={{ minWidth: '40px' }}>#{t.num}</strong>
                    <span style={{ flex: 1, color: '#4A423C' }}>{t.bairro}</span>
                    <span style={{ color: '#7A7068' }}>{statusLabel[t.status] || t.status}</span>
                    <span style={{ fontWeight: 700, minWidth: '64px', textAlign: 'right' }}>
                      {formatMoney(getBairroFee(t.bairro))}
                    </span>
                  </div>
                ))}
                {trips.length === 0 && (
                  <p style={{ margin: 0, padding: '18px 0', textAlign: 'center', fontSize: '13px', color: '#9A9089' }}>
                    Nenhuma entrega hoje.
                  </p>
                )}
              </div>

              {/* Card Footer Financials */}
              <div style={{ padding: '14px 18px', borderTop: '1px solid #F1ECE6', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#6E655E' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>Diária fixa</span>
                  <span>{formatMoney(dailyFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>Taxas · {trips.length} {trips.length === 1 ? 'entrega' : 'entregas'}</span>
                  <span>{formatMoney(totalFees)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px', paddingTop: '10px', borderTop: '1px dashed #ECE6DF', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px' }}>Total a pagar</span>
                    <strong style={{ fontSize: '20px', color: '#1F1A17' }}>{formatMoney(totalPay)}</strong>
                  </div>
                  <button
                    onClick={() => togglePaid(m.id)}
                    style={{
                      border: isPaid ? '1px solid #E2DBD3' : '0',
                      background: isPaid ? '#fff' : '#C41F27',
                      color: isPaid ? '#4A423C' : '#fff',
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
                    {isPaid ? 'Desfazer' : 'Marcar como pago'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
