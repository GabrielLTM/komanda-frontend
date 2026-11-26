import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import AcompanhamentosEditor from './AcompanhamentosEditor';

export default function CategoriasAdmin({ categories, products, onOpenNewCategory, onEditCategory, busy = false, error = '', onToggleCategory, onReorderCategories, onDeleteCategory, onPatchCategory }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const activeCount = categories.filter((c) => c.active !== false).length;
  const inactiveCount = categories.filter((c) => c.active === false).length;

  const moveCategory = async (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= categories.length || busy) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await onReorderCategories(reordered.map((c) => c.id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div><h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Categorias</h1><span style={{ fontSize: '13px', color: '#7A7068' }}>{activeCount} ativas · {inactiveCount} inativas</span></div>
        <button type="button" disabled={busy} onClick={onOpenNewCategory} style={{ border: 0, background: '#C41F27', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} />Nova categoria</button>
      </div>
      {error && <p role="alert" style={{ margin: 0, color: '#8C141B', background: '#FFF0F0', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '10px 12px' }}>{error}</p>}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 100px 120px minmax(240px, 1fr)', gap: '12px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}><span>Categoria</span><span>Status</span><span>Produtos</span><span>Ações</span></div>
        {categories.map((cat, index) => {
          const isActive = cat.active !== false;
          const count = products.filter((p) => p.catId === cat.id).length;
          const isExpanded = expandedId === cat.id;
          const drink = cat.type === 'BEBIDA';
          const baseCount = drink ? (cat.options?.length ?? 0) : (cat.ings?.length ?? 0) + (cat.extras?.length ?? 0);
          return <div key={cat.id} style={{ borderTop: '1px solid #F1ECE6' }}><div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 100px 120px minmax(240px, 1fr)', gap: '12px', padding: '13px 18px', alignItems: 'center' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}><strong style={{ fontSize: '14px', overflowWrap: 'anywhere' }}>{cat.name}</strong><span style={{ fontSize: '12px', color: '#7A7068' }}>{drink ? 'Bebida' : 'Alimento'}</span></span>
            <span style={{ justifySelf: 'start', background: isActive ? '#EAF6EC' : '#F4F0EB', color: isActive ? '#237A33' : '#7A7068', borderRadius: '999px', padding: '5px 9px', fontSize: '12px', fontWeight: 700 }}>{isActive ? 'Ativa' : 'Inativa'}</span>
            <span style={{ fontSize: '13px', color: '#6E655E' }}>{count} {count === 1 ? 'produto' : 'produtos'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {index > 0 && <button type="button" disabled={busy} onClick={() => moveCategory(index, -1)} title="Mover para cima" aria-label={`Mover ${cat.name} para cima`} style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={16} /></button>}
              {index < categories.length - 1 && <button type="button" disabled={busy} onClick={() => moveCategory(index, 1)} title="Mover para baixo" aria-label={`Mover ${cat.name} para baixo`} style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={16} /></button>}
              <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? null : cat.id)} style={{ border: '1px solid #E2DBD3', background: isExpanded ? '#FFF6DB' : '#fff', borderRadius: '8px', padding: '8px 11px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>{isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}Base{baseCount ? ` (${baseCount})` : ''}</button>
              <button type="button" disabled={busy} onClick={() => onEditCategory(cat)} style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '8px', padding: '8px 11px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={13} />Editar</button>
              <button type="button" disabled={busy} onClick={() => onToggleCategory(cat.id)} style={{ border: '1px solid #E2DBD3', background: isActive ? '#EAF6EC' : '#F4F0EB', borderRadius: '8px', padding: '8px 11px', fontSize: '12px', fontWeight: 700, color: isActive ? '#237A33' : '#7A7068' }}>{isActive ? 'Desativar' : 'Ativar'}</button>
              {confirmDelete === cat.id ? <><button type="button" disabled={busy} onClick={async () => { if (await onDeleteCategory(cat.id)) setConfirmDelete(null); }} style={{ border: '1px solid #E7A7AA', background: '#FFF0F0', color: '#8C141B', borderRadius: '8px', padding: '8px 11px', fontSize: '12px', fontWeight: 700 }}>Confirmar exclusão</button><button type="button" onClick={() => setConfirmDelete(null)} style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '8px', padding: '8px 11px', fontSize: '12px' }}>Cancelar</button></> : <button type="button" disabled={busy} onClick={() => setConfirmDelete(cat.id)} style={{ border: '1px solid #E2DBD3', background: '#fff', color: '#8C141B', borderRadius: '8px', padding: '8px 11px', fontSize: '12px', fontWeight: 700 }}>Excluir</button>}
            </div>
          </div>
          {isExpanded && <div style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAFA' }}>
            <span style={{ fontSize: '12px', color: '#6F5200', background: '#FFF6DB', borderRadius: '8px', padding: '8px 10px' }}>Base de {cat.name}: vale para todos os produtos da categoria. Cada produto ainda pode ter os seus, no Cardápio.</span>
            <AcompanhamentosEditor ownerName={cat.name} drink={drink} ings={cat.ings ?? []} extras={cat.extras ?? []} options={cat.options ?? []} busy={busy} onSave={(changes) => onPatchCategory(cat.id, changes)} />
          </div>}
          </div>;
        })}
        {!categories.length && <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089', borderTop: '1px solid #F1ECE6' }}>Nenhuma categoria cadastrada.</p>}
      </div>
      <span style={{ fontSize: '12px', color: '#7A7068' }}>Categorias inativas e seus produtos deixam de aparecer na tela de pedidos. Os produtos continuam cadastrados e voltam a aparecer quando a categoria for reativada.</span>
    </div>
  );
}
