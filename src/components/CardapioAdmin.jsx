import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { formatMoney } from '../utils/format';
import AcompanhamentosEditor from './AcompanhamentosEditor';

export default function CardapioAdmin({
  initialExpandedProductId = null,
  onReturnToOrder,
  products,
  categories,
  onOpenNewProduct,
  onEditProduct,
  busy = false,
  onPatchProduct,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(0);
  const [expandedProductId, setExpandedProductId] = useState(initialExpandedProductId);
  const searchRef = useRef(null);
  const expandedRowRef = useRef(null);
  useEffect(() => {
    if (initialExpandedProductId === null) return;
    setExpandedProductId(initialExpandedProductId);
    setSearchTerm('');
    setSelectedCatId(0);
  }, [initialExpandedProductId]);
  useEffect(() => {
    if (expandedProductId !== initialExpandedProductId) return;
    expandedRowRef.current?.scrollIntoView({ block: 'nearest' });
    expandedRowRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }, [expandedProductId, initialExpandedProductId]);


  const activeCount = products.filter((p) => p.active).length;
  const pausedCount = products.filter((p) => !p.active).length;

  const q = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((p) => {
    if (selectedCatId !== 0 && p.catId !== selectedCatId) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.desc && p.desc.toLowerCase().includes(q))) {
      return false;
    }
    return true;
  });

  const getCategoryName = (catId) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'Sem categoria';
  };

  const handleToggleProductActive = async (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    await onPatchProduct(id, { active: !prod.active });
  };

  const handlePriceChange = async (id, newPriceStr) => {
    const prod = products.find((p) => p.id === id);
    const parsed = parseFloat(newPriceStr.replace(',', '.'));
    if (!prod || isNaN(parsed) || parsed <= 0 || parsed === prod.price) return;

    await onPatchProduct(id, { price: parsed });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {onReturnToOrder && <button type="button" onClick={onReturnToOrder} className="customization-configure" style={{ alignSelf: 'flex-start' }}>Voltar ao pedido</button>}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Cardápio</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            {activeCount} itens à venda · {pausedCount} pausados
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9A9089" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={searchRef}
              aria-label="Buscar no cardápio"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no cardápio"
              style={{
                border: '1px solid #E2DBD3',
                background: '#fff',
                borderRadius: '10px',
                padding: '10px 14px 10px 36px',
                fontSize: '14px',
                width: '240px',
                outline: 'none',
              }}
            />
            {searchTerm && <button type="button" aria-label="Limpar busca do cardápio" onClick={() => { setSearchTerm(''); searchRef.current?.focus(); }} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', padding: '5px', display: 'flex', color: '#7A7068' }}><X size={15} /></button>}
          </div>
          <button
            onClick={onOpenNewProduct}
            style={{
              border: 0,
              background: '#C41F27',
              color: '#fff',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>Novo item</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[{ id: 0, name: 'Todos' }, ...categories].map((c) => {
          const isSelected = selectedCatId === c.id;
          return (
            <button
              type="button"
              disabled={busy}
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
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
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Products Table */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 130px 120px 160px 60px', gap: '16px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          <span>Item</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Acomp. / Adic.</span>
          <span>À venda</span>
        </div>

        {filteredProducts.map((p) => {
          const isExpanded = expandedProductId === p.id;
          const ingsCount = p.ings ? p.ings.length : 0;
          const extrasCount = p.extras ? p.extras.length : 0;
          const acompLabel = ingsCount || extrasCount ? `${ingsCount} acomp. · ${extrasCount} adic.` : 'Configurar opções';

          return (
            <div key={p.id} style={{ borderTop: '1px solid #F1ECE6' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 130px 120px 160px 60px',
                  gap: '16px',
                  padding: '14px 18px',
                  alignItems: 'center',
                  opacity: p.active ? 1 : 0.55,
                }}
              >
                {/* Item Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', minWidth: 0 }}>{p.name}</strong>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEditProduct(p)}
                      style={{
                        border: '1px solid #E2DBD3',
                        background: '#fff',
                        borderRadius: '7px',
                        padding: '6px 9px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#4A423C',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit2 size={11} />
                      <span>Editar</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#7A7068', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.desc}
                  </span>
                </div>

                {/* Category */}
                <span style={{ fontSize: '13px', color: '#6E655E' }}>
                  {getCategoryName(p.catId)}
                </span>

                {/* Price editable input */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2DBD3', borderRadius: '8px', padding: '0 10px', height: '36px', fontSize: '14px', fontWeight: 700, gap: '4px' }}>
                  <span style={{ color: '#9A9089', fontWeight: 500 }}>R$</span>
                  <input
                    aria-label={`Preço de ${p.name}`}
                    disabled={busy}
                    key={p.price}
                    defaultValue={p.price.toFixed(2).replace('.', ',')}
                    onBlur={(e) => handlePriceChange(p.id, e.target.value)}
                    onKeyDown={(e) => {
                      // O onBlur já salva o preço
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    style={{ border: 0, outline: 'none', width: '60px', fontSize: '14px', fontWeight: 700, background: 'transparent' }}
                  />
                </div>

                {/* Companions & Extras accordion toggle */}
                <button
                  type="button"
                  disabled={busy}
                  aria-expanded={isExpanded}
                  aria-controls={`product-options-${p.id}`}
                  aria-label={`${isExpanded ? 'Recolher' : 'Editar'} acompanhamentos e adicionais de ${p.name}`}
                  onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                  style={{
                    border: '1px solid #E2DBD3',
                    background: '#fff',
                    borderRadius: '8px',
                    height: '36px',
                    padding: '0 10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {acompLabel}
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* À venda Switch */}
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`${p.active ? 'Pausar' : 'Ativar'} ${p.name}`}
                  aria-pressed={p.active}
                  onClick={() => handleToggleProductActive(p.id)}
                  style={{
                    border: 0,
                    width: '46px',
                    height: '26px',
                    borderRadius: '999px',
                    background: p.active ? '#2F9E44' : '#D6CFC7',
                    position: 'relative',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: p.active ? '23px' : '3px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.15s',
                    }}
                  ></span>
                </button>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div id={`product-options-${p.id}`} ref={expandedRowRef} style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAFA' }}>
                  <AcompanhamentosEditor
                    ownerName={p.name}
                    ings={p.ings ?? []}
                    extras={p.extras ?? []}
                    inherited={(() => { const c = categories.find((cat) => cat.id === p.catId); return c ? { ings: c.ings ?? [], extras: c.extras ?? [] } : null; })()}
                    busy={busy}
                    onSave={(changes) => onPatchProduct(p.id, changes)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
