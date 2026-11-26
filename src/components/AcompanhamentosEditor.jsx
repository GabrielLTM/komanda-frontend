import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatMoney } from '../utils/format';

const chipBase = { display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '999px', padding: '4px 4px 4px 12px', fontSize: '13px', fontWeight: 600 };
const removeButton = { border: 0, background: 'none', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A7068' };
const inputStyle = { border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' };
const addButton = { border: 0, background: '#1F1A17', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 700 };
const hint = { fontSize: '12px', color: '#7A7068' };

// Edita acompanhamentos (que o atendente pode tirar) e adicionais pagos.
// Serve para a categoria, que define a base, e para o produto, que guarda só o que é dele.
// `inherited` mostra, sem edição, o que o produto já recebe da categoria.
export default function AcompanhamentosEditor({ ownerName, ings = [], extras = [], inherited = null, busy = false, onSave }) {
  const [newIng, setNewIng] = useState('');
  const [newExName, setNewExName] = useState('');
  const [newExPrice, setNewExPrice] = useState('');

  const addIngredient = async () => {
    const name = newIng.trim();
    if (!name || ings.some((i) => i.toLowerCase() === name.toLowerCase())) return;
    if (await onSave({ ings: [...ings, name] })) setNewIng('');
  };

  const addExtra = async () => {
    const name = newExName.trim();
    const price = parseFloat(newExPrice.replace(',', '.'));
    if (!name || isNaN(price) || extras.some((e) => e[0].toLowerCase() === name.toLowerCase())) return;
    if (await onSave({ extras: [...extras, [name, price]] })) {
      setNewExName('');
      setNewExPrice('');
    }
  };

  const hasInherited = inherited && (inherited.ings.length > 0 || inherited.extras.length > 0);

  return (
    <>
      {hasInherited && (
        <span style={{ ...hint, background: '#FFF6DB', borderRadius: '8px', padding: '8px 10px', color: '#6F5200' }}>
          Da categoria: {[...inherited.ings, ...inherited.extras.map(([n, v]) => `${n} +${formatMoney(v)}`)].join(', ')}. Aqui ficam só os itens específicos deste produto; um adicional com o mesmo nome substitui o preço da categoria.
        </span>
      )}

      <span style={hint}>Acompanhamentos que o atendente pode tirar no pedido</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {ings.map((ing) => (
          <span key={ing} style={{ ...chipBase, gap: '4px', border: '1px solid #E2DBD3', background: '#FAF8F5' }}>
            {ing}
            <button type="button" disabled={busy} aria-label={`Remover ${ing} de ${ownerName}`} onClick={() => onSave({ ings: ings.filter((i) => i !== ing) })} style={removeButton}>
              <X size={13} />
            </button>
          </span>
        ))}
        {ings.length === 0 && <span style={{ fontSize: '13px', color: '#9A9089' }}>Nenhum acompanhamento cadastrado.</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '360px' }}>
        <input
          aria-label={`Novo acompanhamento de ${ownerName}`}
          disabled={busy}
          value={newIng}
          onChange={(e) => setNewIng(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addIngredient(); }}
          placeholder="Novo acompanhamento"
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
        />
        <button type="button" disabled={busy} onClick={addIngredient} style={addButton}>Adicionar</button>
      </div>

      <span style={{ ...hint, marginTop: '6px' }}>Adicionais pagos que o atendente pode incluir</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {extras.map(([extraName, extraPrice]) => (
          <span key={extraName} style={{ ...chipBase, border: '1px solid #BFE3C5', background: '#F2FAF3' }}>
            {extraName}
            <span style={{ color: '#237A33', fontWeight: 700 }}>+{formatMoney(extraPrice)}</span>
            <button type="button" disabled={busy} aria-label={`Remover adicional ${extraName} de ${ownerName}`} onClick={() => onSave({ extras: extras.filter((e) => e[0] !== extraName) })} style={removeButton}>
              <X size={13} />
            </button>
          </span>
        ))}
        {extras.length === 0 && <span style={{ fontSize: '13px', color: '#9A9089' }}>Nenhum adicional cadastrado.</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '420px' }}>
        <input aria-label={`Nome do adicional de ${ownerName}`} disabled={busy} value={newExName} onChange={(e) => setNewExName(e.target.value)} placeholder="Novo adicional" style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
        <input
          aria-label={`Preço do adicional de ${ownerName}`}
          disabled={busy}
          value={newExPrice}
          onChange={(e) => setNewExPrice(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addExtra(); }}
          placeholder="R$ 0,00"
          style={{ ...inputStyle, width: '80px' }}
        />
        <button type="button" disabled={busy} onClick={addExtra} style={addButton}>Adicionar</button>
      </div>
    </>
  );
}
