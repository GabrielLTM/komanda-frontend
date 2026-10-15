import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function ConsultaCardapio({ products, categories }) {
  const [searchTerm, setSearchTerm] = useState('');

  const q = searchTerm.trim().toLowerCase();

  const activeCategories = categories.filter((c) => c.active !== false);

  const groupedCategories = activeCategories
    .map((category) => {
      const categoryProducts = products.filter(
        (p) =>
          p.active &&
          p.catId === category.id &&
          (!q || p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)))
      );
      return {
        ...category,
        products: categoryProducts,
      };
    })
    .filter((category) => category.products.length > 0);

  const totalAvailableProducts = groupedCategories.reduce(
    (acc, cat) => acc + cat.products.length,
    0
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Cardápio</h1>
          <span style={{ fontSize: '13px', color: '#7A7068' }}>
            {totalAvailableProducts} {totalAvailableProducts === 1 ? 'produto disponível' : 'produtos disponíveis'}
          </span>
        </div>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={16} color="#9A9089" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar produtos do cardápio"
            placeholder="Buscar produto"
            style={{
              width: '100%',
              border: '1px solid #E2DBD3',
              background: '#fff',
              borderRadius: '10px',
              padding: '10px 14px 10px 36px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      {groupedCategories.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #ECE6DF', borderRadius: '14px', padding: '28px', textAlign: 'center', color: '#7A7068', fontSize: '14px' }}>
          {q ? 'Nenhum produto disponível corresponde à busca.' : 'Nenhum produto disponível no cardápio.'}
        </div>
      )}

      {/* Grouped Sections */}
      {groupedCategories.map((category) => (
        <section key={category.id} aria-label={category.name} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ margin: 0, paddingBottom: '8px', borderBottom: '2px solid #F5B800', fontSize: '17px', fontWeight: 800 }}>
            {category.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {category.products.map((prod) => (
              <article
                key={prod.id}
                style={{
                  background: '#fff',
                  border: '1px solid #ECE6DF',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, lineHeight: 1.35 }}>
                    {prod.name}
                  </h3>
                  <strong style={{ flex: '0 0 auto', color: '#C41F27', fontSize: '15px', fontWeight: 800 }}>
                    {formatMoney(prod.price)}
                  </strong>
                </div>
                {prod.desc && (
                  <p style={{ margin: 0, color: '#7A7068', fontSize: '13px', lineHeight: 1.5 }}>
                    {prod.desc}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
