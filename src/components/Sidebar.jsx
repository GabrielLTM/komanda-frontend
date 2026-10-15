import React from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  BookOpen,
  Search,
  Tag,
  Boxes,
  Bike,
  MapPin,
  BarChart3,
  Clock,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  ordersCount,
  waitMinutes,
  setWaitMinutes,
}) {
  const navItems = [
    { id: 'pedido', label: 'Novo pedido', icon: UtensilsCrossed, key: 'F1' },
    { id: 'quadro', label: 'Pedidos', icon: ShoppingBag, badge: ordersCount > 0 ? String(ordersCount) : null },
    { id: 'cardapio', label: 'Cardápio', icon: BookOpen, key: 'F2' },
    { id: 'consulta', label: 'Consultar cardápio', icon: Search },
    { id: 'categorias', label: 'Categorias', icon: Tag },
    { id: 'estoque', label: 'Estoque', icon: Boxes },
    { id: 'motoboy', label: 'Motoboys', icon: Bike },
    { id: 'bairros', label: 'Bairros & taxas', icon: MapPin },
    { id: 'caixa', label: 'Caixa & Relatórios', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        background: '#fff',
        borderRight: '1px solid #ECE6DF',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '210px',
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px' }}>
        <img
          src="/assets/images/image-c323933e.png"
          alt="Mau Mau"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '15px', fontWeight: 800 }}>Mau Mau</strong>
          <span style={{ fontSize: '12px', color: '#7A7068' }}>Lanches · Guaíba</span>
        </div>
      </div>

      {/* Navigation with Lucide Icons */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 0,
                textAlign: 'left',
                padding: '11px 12px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                background: isActive ? '#C41F27' : 'transparent',
                color: isActive ? '#fff' : '#4A423C',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ opacity: isActive ? 1 : 0.75 }} />
                <span>{item.label}</span>
              </div>

              {item.key && (
                <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.8 }}>
                  {item.key}
                </span>
              )}

              {item.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    background: isActive ? '#fff' : '#C41F27',
                    color: isActive ? '#C41F27' : '#fff',
                    borderRadius: '999px',
                    padding: '2px 7px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Wait Time Indicator */}
      <div
        style={{
          marginTop: 'auto',
          background: '#FFF6DB',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#7A5A00" />
          <span style={{ fontSize: '12px', color: '#7A5A00', fontWeight: 600 }}>
            Tempo de espera
          </span>
        </div>
        <label
          title="Clique para editar"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            border: '1.5px solid transparent',
            borderRadius: '8px',
            padding: '2px 6px',
            margin: '0 -6px',
            cursor: 'text',
          }}
        >
          <input
            type="number"
            min="0"
            step="5"
            value={waitMinutes}
            onChange={(e) => setWaitMinutes(e.target.value)}
            onFocus={(e) => e.target.select()}
            style={{
              width: '52px',
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1F1A17',
              padding: 0,
            }}
          />
          <span style={{ fontSize: '20px', fontWeight: 700 }}>min</span>
        </label>
      </div>
    </aside>
  );
}
