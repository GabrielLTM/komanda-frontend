import React, { useRef, useState } from 'react';
import { Search, Plus, Save, X } from 'lucide-react';
import { formatMoney } from '../utils/format';

const fieldStyle = { border: '1px solid #E2DBD3', borderRadius: '8px', padding: '9px 11px', fontSize: '14px', outline: 'none', minWidth: 0 };
const moneyValue = (value) => String(value).trim() === '' ? Number.NaN : Number(String(value).replace(',', '.'));
const feeText = (value) => Number(value).toFixed(2).replace('.', ',');

export default function BairrosAdmin({ bairros, busy, error, onCreate, onUpdate, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({ name: '', fee: '' });
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const searchRef = useRef(null);
  const q = searchTerm.trim().toLowerCase();
  const filtered = bairros.filter((b) => !q || b.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  const activeFees = bairros.filter((b) => b.active).map((b) => b.fee);
  const feeRange = activeFees.length ? `${formatMoney(Math.min(...activeFees))} a ${formatMoney(Math.max(...activeFees))}` : '—';

  const create = async (event) => {
    event.preventDefault();
    const fee = moneyValue(newEntry.fee);
    if (!newEntry.name.trim() || !Number.isFinite(fee) || fee < 0) {
      setFormError('Informe o nome do bairro e uma taxa válida.');
      return;
    }
    setFormError('');
    if (await onCreate({ name: newEntry.name.trim(), fee })) setNewEntry({ name: '', fee: '' });
  };
  const beginEdit = (b) => setEditing({ id: b.id, name: b.name, fee: feeText(b.fee) });
  const saveEdit = async (event) => {
    event.preventDefault();
    const fee = moneyValue(editing.fee);
    if (!editing.name.trim() || !Number.isFinite(fee) || fee < 0) {
      setFormError('Informe o nome do bairro e uma taxa válida.');
      return;
    }
    setFormError('');
    if (await onUpdate(editing.id, { name: editing.name.trim(), fee })) setEditing(null);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div><h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Bairros &amp; taxas de entrega</h1><span style={{ fontSize: '13px', color: '#7A7068' }}>{bairros.filter((b) => b.active).length} bairros ativos · taxas de {feeRange}</span></div>
        <div style={{ position: 'relative', width: '220px', maxWidth: '100%' }}><Search size={16} color="#9A9089" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} /><input ref={searchRef} aria-label="Buscar bairro" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar bairro" style={{ ...fieldStyle, width: '100%', paddingLeft: '36px', paddingRight: searchTerm ? '34px' : '11px', background: '#fff' }} />{searchTerm && <button type="button" aria-label="Limpar busca de bairros" onClick={() => { setSearchTerm(''); searchRef.current?.focus(); }} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', padding: '5px', display: 'flex', color: '#7A7068' }}><X size={15} /></button>}</div>
      </header>
      {(formError || error) && <p role="alert" style={{ margin: 0, color: '#8C141B', background: '#FFF0F0', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '10px 12px' }}>{formError || error}</p>}
      <form noValidate onSubmit={create} style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <strong style={{ fontSize: '13px' }}>Cadastrar bairro</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input aria-label="Nome do bairro" aria-invalid={!!formError && !newEntry.name.trim()} value={newEntry.name} onChange={(e) => { setNewEntry({ ...newEntry, name: e.target.value }); setFormError(''); }} placeholder="Nome do bairro" style={{ ...fieldStyle, flex: '1 1 200px' }} />
          <label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>R$ <input aria-label="Taxa de entrega" aria-invalid={!!formError && (!Number.isFinite(moneyValue(newEntry.fee)) || moneyValue(newEntry.fee) < 0)} inputMode="decimal" value={newEntry.fee} onChange={(e) => { setNewEntry({ ...newEntry, fee: e.target.value }); setFormError(''); }} placeholder="0,00" style={{ width: '78px', border: 0, outline: 'none' }} /></label>
          <button disabled={busy} type="submit" style={{ border: 0, background: '#C41F27', color: '#fff', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} />Adicionar</button>
        </div>
      </form>
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 130px 70px 190px', gap: '14px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}><span>Bairro</span><span>Taxa</span><span>Ativo</span><span>Ações</span></div>
        {filtered.map((b) => {
          const draft = editing?.id === b.id ? editing : null;
          return <div key={b.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 130px 70px 190px', gap: '14px', padding: '10px 18px', borderTop: '1px solid #F1ECE6', alignItems: 'center', opacity: b.active ? 1 : 0.6 }}>
            {draft ? <><input aria-label="Nome do bairro" autoFocus value={draft.name} onChange={(e) => setEditing({ ...draft, name: e.target.value })} style={fieldStyle} /><label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>R$ <input aria-label="Taxa de entrega" inputMode="decimal" value={draft.fee} onChange={(e) => setEditing({ ...draft, fee: e.target.value })} style={{ border: 0, outline: 'none', width: '100%' }} /></label><span>—</span><form noValidate onSubmit={saveEdit} style={{ display: 'flex', gap: '6px' }}><button disabled={busy} type="submit" aria-label="Salvar bairro" style={{ ...fieldStyle, padding: '7px 9px', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={14} />Salvar</button><button type="button" onClick={() => setEditing(null)} aria-label="Cancelar edição" style={{ ...fieldStyle, padding: '7px' }}><X size={14} /></button></form></> : <>
              <strong style={{ fontSize: '14px' }}>{b.name}</strong><span style={{ fontSize: '14px', fontWeight: 700 }}>{formatMoney(b.fee)}</span>
              <button type="button" disabled={busy} onClick={() => onUpdate(b.id, { active: !b.active })} aria-label={`${b.active ? 'Desativar' : 'Ativar'} ${b.name}`} aria-pressed={b.active} style={{ border: 0, width: '46px', height: '26px', borderRadius: '999px', background: b.active ? '#2F9E44' : '#D6CFC7', position: 'relative', padding: 0, cursor: 'pointer' }}><span style={{ position: 'absolute', top: '3px', left: b.active ? '23px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} /></button>
              <div style={{ display: 'flex', gap: '6px' }}><button type="button" disabled={busy} onClick={() => beginEdit(b)} style={{ ...fieldStyle, padding: '7px 10px' }}>Editar</button>{confirmDelete === b.id ? <><button type="button" disabled={busy} onClick={async () => { if (await onDelete(b.id)) setConfirmDelete(null); }} style={{ ...fieldStyle, padding: '7px 10px', color: '#8C141B' }}>Confirmar</button><button type="button" onClick={() => setConfirmDelete(null)} aria-label="Cancelar exclusão" style={{ ...fieldStyle, padding: '7px' }}><X size={14} /></button></> : <button type="button" disabled={busy} onClick={() => setConfirmDelete(b.id)} style={{ ...fieldStyle, padding: '7px 10px', color: '#8C141B' }}>Excluir</button>}</div>
            </>}
          </div>;
        })}
        {filtered.length === 0 && <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089', borderTop: '1px solid #F1ECE6' }}>{bairros.length ? 'Nenhum bairro encontrado.' : 'Nenhum bairro cadastrado.'}</p>}
      </div>
    </section>
  );
}
