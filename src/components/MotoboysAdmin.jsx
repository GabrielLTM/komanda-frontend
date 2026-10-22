import React, { useState } from 'react';
import { Bike, Phone, Plus, Save, X } from 'lucide-react';
import { formatMoney } from '../utils/format';

const fieldStyle = { border: '1px solid #E2DBD3', borderRadius: '8px', padding: '9px 11px', fontSize: '14px', outline: 'none', minWidth: 0 };
const moneyValue = (value) => String(value).trim() === '' ? Number.NaN : Number(String(value).replace(',', '.'));

export default function MotoboysAdmin({ motoboys, busy, error, defaultDailyFee = 0, onCreate, onUpdate, onDelete }) {
  const [newEntry, setNewEntry] = useState({ name: '', phone: '', baseFee: String(defaultDailyFee).replace('.', ',') });
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState('');

  const create = async (event) => {
    event.preventDefault();
    const fee = moneyValue(newEntry.baseFee);
    if (!newEntry.name.trim() || !Number.isFinite(fee) || fee < 0) {
      setFormError('Informe o nome e uma diária válida (zero também é permitido).');
      return;
    }
    setFormError('');
    if (await onCreate({ name: newEntry.name.trim(), phone: newEntry.phone.trim(), baseFee: fee })) {
      setNewEntry({ name: '', phone: '', baseFee: String(defaultDailyFee).replace('.', ',') });
    }
  };

  const beginEdit = (m) => setEditing({ id: m.id, name: m.name, phone: m.phone ?? '', baseFee: String(m.baseFee).replace('.', ',') });
  const saveEdit = async (event) => {
    event.preventDefault();
    const fee = moneyValue(editing.baseFee);
    if (!editing.name.trim() || !Number.isFinite(fee) || fee < 0) {
      setFormError('Informe o nome e uma diária válida (zero também é permitido).');
      return;
    }
    setFormError('');
    if (await onUpdate(editing.id, { name: editing.name.trim(), phone: editing.phone.trim(), baseFee: fee })) setEditing(null);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Motoboys</h1>
        <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#7A7068' }}>Cadastro e diária de cada motoboy.</p>
      </header>
      <div role="status" style={{ background: '#FFF6DB', color: '#6F5200', border: '1px solid #E9D18A', borderRadius: '10px', padding: '11px 14px', fontSize: '13px' }}>
        Viagens e acerto ainda não estão disponíveis; nenhum valor de entrega é calculado aqui.
      </div>
      {(formError || error) && <p role="alert" style={{ margin: 0, color: '#8C141B', background: '#FFF0F0', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '10px 12px' }}>{formError || error}</p>}
      <form noValidate onSubmit={create} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <strong style={{ fontSize: '13px' }}>Cadastrar motoboy</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input aria-label="Nome do motoboy" aria-invalid={!!formError && !newEntry.name.trim()} placeholder="Nome completo" value={newEntry.name} onChange={(e) => { setNewEntry({ ...newEntry, name: e.target.value }); setFormError(''); }} style={{ ...fieldStyle, flex: '1 1 180px' }} />
          <input aria-label="Telefone do motoboy" placeholder="Telefone (opcional)" value={newEntry.phone} onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })} style={{ ...fieldStyle, flex: '1 1 150px' }} />
          <label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '5px' }}><span>R$</span><input aria-label="Diária do novo motoboy" aria-invalid={!!formError && (!Number.isFinite(moneyValue(newEntry.baseFee)) || moneyValue(newEntry.baseFee) < 0)} inputMode="decimal" value={newEntry.baseFee} onChange={(e) => { setNewEntry({ ...newEntry, baseFee: e.target.value }); setFormError(''); }} style={{ width: '76px', border: 0, outline: 'none' }} /></label>
          <button type="submit" disabled={busy} style={{ border: 0, background: '#C41F27', color: '#fff', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} />Adicionar</button>
        </div>
      </form>
      {motoboys.length === 0 && <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089' }}>Nenhum motoboy cadastrado.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {motoboys.map((m) => {
          const draft = editing?.id === m.id ? editing : null;
          return <article key={m.id} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: m.active ? 1 : 0.65 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Bike size={19} color="#C41F27" /><strong style={{ flex: 1 }}>{m.name}</strong><span style={{ fontSize: '11px', color: m.active ? '#237A33' : '#7A7068', background: m.active ? '#EAF6EC' : '#F1ECE6', padding: '4px 7px', borderRadius: '6px' }}>{m.active ? 'Ativo' : 'Inativo'}</span></div>
            {draft ? <form noValidate onSubmit={saveEdit} style={{ display: 'grid', gap: '8px' }}>
              <input autoFocus aria-label="Nome do motoboy" value={draft.name} onChange={(e) => setEditing({ ...draft, name: e.target.value })} style={fieldStyle} />
              <input aria-label="Telefone do motoboy" value={draft.phone} onChange={(e) => setEditing({ ...draft, phone: e.target.value })} style={fieldStyle} />
              <label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>Diária R$ <input aria-label="Diária do motoboy" inputMode="decimal" value={draft.baseFee} onChange={(e) => setEditing({ ...draft, baseFee: e.target.value })} style={{ width: '80px', border: 0, outline: 'none' }} /></label>
              <div style={{ display: 'flex', gap: '8px' }}><button disabled={busy} type="submit" style={{ ...fieldStyle, background: '#C41F27', color: '#fff', border: 0, display: 'flex', alignItems: 'center', gap: '5px' }}><Save size={14} />Salvar</button><button type="button" onClick={() => setEditing(null)} style={fieldStyle}>Cancelar</button></div>
            </form> : <>
              {m.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#7A7068' }}><Phone size={13} />{m.phone}</span>}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1ECE6', paddingTop: '10px', fontSize: '13px' }}><span>Diária fixa por cadastro</span><strong>{formatMoney(m.baseFee)}</strong></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button disabled={busy} type="button" onClick={() => beginEdit(m)} style={fieldStyle}>Editar</button>
                <button disabled={busy} type="button" onClick={() => onUpdate(m.id, { active: !m.active })} style={fieldStyle}>{m.active ? 'Desativar' : 'Ativar'}</button>
                {confirmDelete === m.id ? <><button disabled={busy} type="button" onClick={async () => { if (await onDelete(m.id)) setConfirmDelete(null); }} style={{ ...fieldStyle, color: '#8C141B' }}>Confirmar exclusão</button><button type="button" onClick={() => setConfirmDelete(null)} style={fieldStyle}><X size={14} /></button></> : <button disabled={busy} type="button" onClick={() => setConfirmDelete(m.id)} style={{ ...fieldStyle, color: '#8C141B' }}>Excluir</button>}
              </div>
            </>}
          </article>;
        })}
      </div>
    </section>
  );
}
