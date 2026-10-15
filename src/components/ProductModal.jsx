import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function ProductModal({
  productToEdit,
  categories,
  onClose,
  onSave,
  onAddCategory,
}) {
  const [name, setName] = useState(productToEdit ? productToEdit.name : '');
  const [desc, setDesc] = useState(productToEdit ? productToEdit.desc || '' : '');
  const [price, setPrice] = useState(productToEdit ? String(productToEdit.price).replace('.', ',') : '');
  const [catId, setCatId] = useState(
    productToEdit ? productToEdit.catId : (categories.find((c) => c.active !== false) || {}).id || 1
  );
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [tried, setTried] = useState(false);

  const cleanName = name.trim();
  const parsedPrice = parseFloat(String(price).replace(',', '.'));
  const isPriceValid = !isNaN(parsedPrice) && parsedPrice > 0;

  let activeCatId = catId;
  const isCategoryValid = isCreatingNewCat
    ? !!newCatName.trim()
    : categories.some((c) => c.id === catId && c.active !== false);

  const nameError = tried && !cleanName ? 'Informe o nome do produto.' : '';
  const priceError = tried && !isPriceValid ? 'Informe um preço maior que zero.' : '';
  const catError = tried && !isCategoryValid ? (isCreatingNewCat ? 'Informe o nome da categoria.' : 'Selecione uma categoria ativa.') : '';

  const handleSave = () => {
    if (!cleanName || !isPriceValid || !isCategoryValid) {
      setTried(true);
      return;
    }

    let finalCatId = catId;
    if (isCreatingNewCat && newCatName.trim()) {
      finalCatId = onAddCategory(newCatName.trim());
    }

    const payload = {
      ...(productToEdit || {}),
      name: cleanName,
      desc: desc.trim(),
      price: parsedPrice,
      catId: finalCatId,
      active: productToEdit ? productToEdit.active : true,
      ings: productToEdit ? productToEdit.ings : [],
      extras: productToEdit ? productToEdit.extras : [],
    };

    onSave(payload);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31,26,23,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1ECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '18px', fontWeight: 800 }}>
            {productToEdit ? 'Editar produto' : 'Novo item no cardápio'}
          </strong>
          <button
            onClick={onClose}
            style={{ border: 0, background: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Nome */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4A423C' }}>
            Nome do item
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setTried(false);
              }}
              maxLength={100}
              placeholder="Ex: Xis Frango"
              style={{
                border: nameError ? '1px solid #C41F27' : '1px solid #E2DBD3',
                borderRadius: '8px',
                padding: '11px 12px',
                fontSize: '15px',
                fontWeight: 500,
                outline: 'none',
              }}
            />
          </label>
          {nameError && <span style={{ marginTop: '-12px', fontSize: '12px', color: '#C41F27' }}>{nameError}</span>}

          {/* Categoria Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4A423C' }}>Categoria</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories
                .filter((c) => c.active !== false || (productToEdit && c.id === productToEdit.catId))
                .map((c) => {
                  const isSelected = !isCreatingNewCat && catId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCatId(c.id);
                        setIsCreatingNewCat(false);
                      }}
                      style={{
                        border: isSelected ? '1.5px solid #1F1A17' : '1.5px solid #E2DBD3',
                        background: isSelected ? '#1F1A17' : '#fff',
                        color: isSelected ? '#fff' : '#1F1A17',
                        borderRadius: '999px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {c.name}
                      {c.active === false ? ' (inativa)' : ''}
                    </button>
                  );
                })}
              <button
                type="button"
                onClick={() => setIsCreatingNewCat(true)}
                style={{
                  border: isCreatingNewCat ? '1.5px dashed #C41F27' : '1.5px dashed #E2C2C3',
                  background: isCreatingNewCat ? '#FDECEC' : '#fff',
                  color: '#C41F27',
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Nova categoria
              </button>
            </div>

            {isCreatingNewCat && (
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da nova categoria (ex: Pastéis)"
                style={{
                  border: catError ? '1px solid #C41F27' : '1px solid #F5B800',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  background: '#FFFBF0',
                  outline: 'none',
                }}
              />
            )}
            {catError && <span style={{ fontSize: '12px', color: '#C41F27' }}>{catError}</span>}
          </div>

          {/* Preço e Descrição */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px minmax(0, 1fr)', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4A423C' }}>
              Preço
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: priceError ? '1px solid #C41F27' : '1px solid #E2DBD3', borderRadius: '8px', padding: '0 12px', height: '43px' }}>
                <span style={{ color: '#9A9089', fontWeight: 500 }}>R$</span>
                <input
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setTried(false);
                  }}
                  inputMode="decimal"
                  placeholder="0,00"
                  style={{ border: 0, outline: 'none', width: '100%', fontSize: '15px', fontWeight: 700 }}
                />
              </div>
              {priceError && <span style={{ fontSize: '12px', fontWeight: 400, color: '#C41F27' }}>{priceError}</span>}
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4A423C' }}>
              Descrição
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ingredientes, tamanho…"
                style={{ border: '1px solid #E2DBD3', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', fontWeight: 500, outline: 'none' }}
              />
            </label>
          </div>

          <span style={{ fontSize: '12px', color: '#7A7068' }}>
            Acompanhamentos e adicionais podem ser cadastrados depois, na linha do item.
          </span>
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid #F1ECE6', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '10px', padding: '11px 18px', fontSize: '14px', fontWeight: 700 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ border: 0, background: '#C41F27', color: '#fff', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 800 }}
          >
            {productToEdit ? 'Salvar alterações' : 'Salvar item'}
          </button>
        </div>
      </div>
    </div>
  );
}
