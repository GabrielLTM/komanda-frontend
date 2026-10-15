import React from 'react';
import { Plus, ArrowUp, ArrowDown, Edit2 } from 'lucide-react';

export default function CategoriasAdmin({
  categories,
  setCategories,
  products,
  onOpenNewCategory,
  onEditCategory,
}) {
  const activeCount = categories.filter((c) => c.active !== false).length;
  const inactiveCount = categories.filter((c) => c.active === false).length;

  const moveCategory = (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= categories.length) return;
    const newCats = [...categories];
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];
    setCategories(newCats);
  };

  const toggleCategoryActive = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: c.active === false ? true : false } : c))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Categorias</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            {activeCount} ativas · {inactiveCount} inativas
          </span>
        </div>
        <button
          onClick={onOpenNewCategory}
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
          <span>Nova categoria</span>
        </button>
      </div>

      {/* Categories Table */}
      <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 100px 120px 245px', gap: '12px', padding: '12px 18px', background: '#FAF8F5', fontSize: '12px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          <span>Categoria</span>
          <span>Status</span>
          <span>Produtos</span>
          <span>Ações</span>
        </div>

        {categories.map((cat, index) => {
          const isActive = cat.active !== false;
          const productCount = products.filter((p) => p.catId === cat.id).length;

          return (
            <div
              key={cat.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1fr) 100px 120px 245px',
                gap: '12px',
                padding: '13px 18px',
                borderTop: '1px solid #F1ECE6',
                alignItems: 'center',
              }}
            >
              <strong style={{ fontSize: '14px', minWidth: 0, overflowWrap: 'anywhere' }}>
                {cat.name}
              </strong>

              <span
                style={{
                  justifySelf: 'start',
                  background: isActive ? '#EAF6EC' : '#F4F0EB',
                  color: isActive ? '#237A33' : '#7A7068',
                  borderRadius: '999px',
                  padding: '5px 9px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {isActive ? 'Ativa' : 'Inativa'}
              </span>

              <span style={{ fontSize: '13px', color: '#6E655E' }}>
                {productCount} {productCount === 1 ? 'produto' : 'produtos'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {index > 0 && (
                  <button
                    onClick={() => moveCategory(index, -1)}
                    title="Mover para cima"
                    style={{
                      border: '1px solid #E2DBD3',
                      background: '#fff',
                      borderRadius: '8px',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4A423C',
                    }}
                  >
                    <ArrowUp size={16} />
                  </button>
                )}
                {index < categories.length - 1 && (
                  <button
                    onClick={() => moveCategory(index, 1)}
                    title="Mover para baixo"
                    style={{
                      border: '1px solid #E2DBD3',
                      background: '#fff',
                      borderRadius: '8px',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4A423C',
                    }}
                  >
                    <ArrowDown size={16} />
                  </button>
                )}
                <button
                  onClick={() => onEditCategory(cat)}
                  style={{
                    border: '1px solid #E2DBD3',
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '8px 11px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#4A423C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Edit2 size={13} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => toggleCategoryActive(cat.id)}
                  style={{
                    border: isActive ? '1px solid #EAF6EC' : '1px solid #F4F0EB',
                    background: isActive ? '#EAF6EC' : '#F4F0EB',
                    borderRadius: '8px',
                    padding: '8px 11px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isActive ? '#237A33' : '#7A7068',
                  }}
                >
                  {isActive ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <p style={{ margin: 0, padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9A9089', borderTop: '1px solid #F1ECE6' }}>
            Nenhuma categoria cadastrada.
          </p>
        )}
      </div>

      <span style={{ fontSize: '12px', color: '#7A7068' }}>
        Categorias inativas e seus produtos deixam de aparecer na tela de pedidos. Os produtos continuam cadastrados e voltam a aparecer quando a categoria for reativada.
      </span>
    </div>
  );
}
