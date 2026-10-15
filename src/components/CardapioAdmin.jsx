import React, { useState } from 'react';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function CardapioAdmin({
  products,
  setProducts,
  categories,
  onOpenNewProduct,
  onEditProduct,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(0);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const [newIngInputs, setNewIngInputs] = useState({});
  const [newExNameInputs, setNewExNameInputs] = useState({});
  const [newExPriceInputs, setNewExPriceInputs] = useState({});

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

  const handleToggleProductActive = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handlePriceChange = (id, newPriceStr) => {
    const parsed = parseFloat(newPriceStr.replace(',', '.'));
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: isNaN(parsed) ? p.price : parsed } : p))
    );
  };

  const handleAddIngredient = (productId) => {
    const ingName = (newIngInputs[productId] || '').trim();
    if (!ingName) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (p.ings && p.ings.includes(ingName)) return p;
        return { ...p, ings: [...(p.ings || []), ingName] };
      })
    );
    setNewIngInputs((prev) => ({ ...prev, [productId]: '' }));
  };

  const handleDeleteIngredient = (productId, ingName) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return { ...p, ings: (p.ings || []).filter((i) => i !== ingName) };
      })
    );
  };

  const handleAddExtra = (productId) => {
    const exName = (newExNameInputs[productId] || '').trim();
    const exPriceStr = newExPriceInputs[productId] || '';
    const exPrice = parseFloat(exPriceStr.replace(',', '.'));
    if (!exName || isNaN(exPrice)) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (p.extras && p.extras.some((e) => e[0] === exName)) return p;
        return { ...p, extras: [...(p.extras || []), [exName, exPrice]] };
      })
    );
    setNewExNameInputs((prev) => ({ ...prev, [productId]: '' }));
    setNewExPriceInputs((prev) => ({ ...prev, [productId]: '' }));
  };

  const handleDeleteExtra = (productId, extraName) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return { ...p, extras: (p.extras || []).filter((e) => e[0] !== extraName) };
      })
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          const acompLabel = `${ingsCount ? `${ingsCount} acomp.` : 'Nenhum'}${extrasCount ? ` · ${extrasCount} adic.` : ''}`;

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
                    defaultValue={p.price.toFixed(2).replace('.', ',')}
                    onBlur={(e) => handlePriceChange(p.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePriceChange(p.id, e.currentTarget.value);
                        e.currentTarget.blur();
                      }
                    }}
                    style={{ border: 0, outline: 'none', width: '60px', fontSize: '14px', fontWeight: 700, background: 'transparent' }}
                  />
                </div>

                {/* Companions & Extras accordion toggle */}
                <button
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
                <div style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAFA' }}>
                  {/* Acompanhamentos */}
                  <span style={{ fontSize: '12px', color: '#7A7068' }}>
                    Acompanhamentos que o atendente pode tirar no pedido
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {p.ings && p.ings.map((ing) => (
                      <span
                        key={ing}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid #E2DBD3',
                          borderRadius: '999px',
                          padding: '4px 4px 4px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#FAF8F5',
                        }}
                      >
                        {ing}
                        <button
                          onClick={() => handleDeleteIngredient(p.id, ing)}
                          style={{
                            border: 0,
                            background: 'none',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7A7068',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    {(!p.ings || p.ings.length === 0) && (
                      <span style={{ fontSize: '13px', color: '#9A9089' }}>
                        Nenhum acompanhamento cadastrado.
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '360px' }}>
                    <input
                      value={newIngInputs[p.id] || ''}
                      onChange={(e) => setNewIngInputs({ ...newIngInputs, [p.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddIngredient(p.id);
                      }}
                      placeholder="Novo acompanhamento"
                      style={{ flex: 1, minWidth: 0, border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}
                    />
                    <button
                      onClick={() => handleAddIngredient(p.id)}
                      style={{ border: 0, background: '#1F1A17', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 700 }}
                    >
                      Adicionar
                    </button>
                  </div>

                  {/* Adicionais Pagos */}
                  <span style={{ fontSize: '12px', color: '#7A7068', marginTop: '6px' }}>
                    Adicionais pagos que o atendente pode incluir
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {p.extras && p.extras.map(([extraName, extraPrice]) => (
                      <span
                        key={extraName}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #BFE3C5',
                          borderRadius: '999px',
                          padding: '4px 4px 4px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#F2FAF3',
                        }}
                      >
                        {extraName}
                        <span style={{ color: '#237A33', fontWeight: 700 }}>
                          +{formatMoney(extraPrice)}
                        </span>
                        <button
                          onClick={() => handleDeleteExtra(p.id, extraName)}
                          style={{
                            border: 0,
                            background: 'none',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7A7068',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    {(!p.extras || p.extras.length === 0) && (
                      <span style={{ fontSize: '13px', color: '#9A9089' }}>
                        Nenhum adicional cadastrado.
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '420px' }}>
                    <input
                      value={newExNameInputs[p.id] || ''}
                      onChange={(e) => setNewExNameInputs({ ...newExNameInputs, [p.id]: e.target.value })}
                      placeholder="Novo adicional"
                      style={{ flex: 1, minWidth: 0, border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}
                    />
                    <input
                      value={newExPriceInputs[p.id] || ''}
                      onChange={(e) => setNewExPriceInputs({ ...newExPriceInputs, [p.id]: e.target.value })}
                      placeholder="R$ 0,00"
                      style={{ width: '80px', border: '1px solid #E2DBD3', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}
                    />
                    <button
                      onClick={() => handleAddExtra(p.id)}
                      style={{ border: 0, background: '#1F1A17', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 700 }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
