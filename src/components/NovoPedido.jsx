import React, { useState } from 'react';
import { Search, Plus, Minus, Printer, Send } from 'lucide-react';
import { formatMoney, formatPhone } from '../utils/format';

export default function NovoPedido({
  products,
  categories,
  bairros,
  cart,
  setCart,
  orderNum,
  onFinishOrder,
  onPreviewCart,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(0); // 0 = Todos
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'balcao'
  const [selectedBairro, setSelectedBairro] = useState('Parque 35');
  const [street, setStreet] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [cashGiven, setCashGiven] = useState('');
  const [fiadoName, setFiadoName] = useState('');
  const [fiadoError, setFiadoError] = useState(false);
  const [openCustomLineKey, setOpenCustomLineKey] = useState(null);

  const activeCategoryIds = new Set(categories.filter((c) => c.active !== false).map((c) => c.id));
  const activeCategoriesList = [{ id: 0, name: 'Todos' }, ...categories.filter((c) => c.active !== false)];

  const getProduct = (id) => products.find((p) => p.id === id);

  const filteredProducts = products.filter((p) => {
    if (!p.active || !activeCategoryIds.has(p.catId)) return false;
    if (selectedCatId !== 0 && p.catId !== selectedCatId) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q));
    }
    return true;
  });

  const getLineUnitPrice = (line) => {
    const p = getProduct(line.productId);
    if (!p) return 0;
    const extrasTotal = line.added.reduce((sum, extraName) => {
      const found = p.extras ? p.extras.find((e) => e[0] === extraName) : null;
      return sum + (found ? found[1] : 0);
    }, 0);
    return p.price + extrasTotal;
  };

  const getProductTotalInCart = (prodId) => {
    return cart
      .filter((l) => l.productId === prodId)
      .reduce((sum, l) => sum + l.qty, 0);
  };

  const handleAddProduct = (prodId) => {
    const existingIndex = cart.findIndex(
      (l) => l.productId === prodId && l.added.length === 0 && l.removed.length === 0
    );
    if (existingIndex >= 0) {
      setCart((prev) =>
        prev.map((line, idx) => (idx === existingIndex ? { ...line, qty: line.qty + 1 } : line))
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          key: Date.now() + Math.random(),
          productId: prodId,
          qty: 1,
          added: [],
          removed: [],
        },
      ]);
    }
  };

  const handleLineQtyChange = (key, delta) => {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const handleToggleIngredient = (key, ing) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const exists = l.removed.includes(ing);
        return {
          ...l,
          removed: exists ? l.removed.filter((i) => i !== ing) : [...l.removed, ing],
        };
      })
    );
  };

  const handleToggleExtra = (key, extraName) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const exists = l.added.includes(extraName);
        return {
          ...l,
          added: exists ? l.added.filter((e) => e !== extraName) : [...l.added, extraName],
        };
      })
    );
  };

  const subtotal = cart.reduce((sum, l) => sum + l.qty * getLineUnitPrice(l), 0);
  const deliveryFee =
    orderType === 'delivery'
      ? (bairros.find((b) => b.name === selectedBairro) || { fee: 0 }).fee
      : 0;
  const grandTotal = subtotal + deliveryFee;
  const changeValue =
    paymentMethod === 'Dinheiro' && Number(cashGiven) > grandTotal
      ? Number(cashGiven) - grandTotal
      : 0;

  const handleFinish = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Fiado' && !fiadoName.trim()) {
      setFiadoError(true);
      return;
    }

    const orderTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const orderDoc = {
      num: orderNum,
      time: orderTime,
      type: orderType,
      bairro: orderType === 'delivery' ? selectedBairro : '',
      street: orderType === 'delivery' ? street : '',
      phone: phone,
      cash: cashGiven,
      pay: paymentMethod,
      fiadoName: paymentMethod === 'Fiado' ? fiadoName.trim() : '',
      fiadoPaid: false,
      total: grandTotal,
      moto: null,
      items: cart.map((line) => {
        const p = getProduct(line.productId);
        const mods = [
          ...line.added.map((n) => '+ ' + n.toLowerCase()),
          ...line.removed.map((r) => 'sem ' + r.toLowerCase()),
        ].join(', ');
        return {
          t: `${line.qty}x ${p.name}`,
          v: getLineUnitPrice(line) * line.qty,
          mod: mods,
        };
      }),
    };

    onFinishOrder(orderDoc);

    setStreet('');
    setPhone('');
    setCashGiven('');
    setFiadoName('');
    setFiadoError(false);
    setOpenCustomLineKey(null);
  };

  const handlePreview = () => {
    if (cart.length === 0) return;
    const orderTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const cartDoc = {
      num: orderNum,
      time: orderTime,
      type: orderType,
      bairro: orderType === 'delivery' ? selectedBairro : '',
      street: orderType === 'delivery' ? street : '',
      phone: phone,
      cash: cashGiven,
      pay: paymentMethod,
      fiadoName: paymentMethod === 'Fiado' ? fiadoName.trim() : '',
      fiadoPaid: false,
      total: grandTotal,
      moto: null,
      items: cart.map((line) => {
        const p = getProduct(line.productId);
        const mods = [
          ...line.added.map((n) => '+ ' + n.toLowerCase()),
          ...line.removed.map((r) => 'sem ' + r.toLowerCase()),
        ].join(', ');
        return {
          t: `${line.qty}x ${p.name}`,
          v: getLineUnitPrice(line) * line.qty,
          mod: mods,
        };
      }),
    };
    onPreviewCart(cartDoc);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(320px,360px)',
        gap: '18px',
        alignItems: 'start',
      }}
    >
      {/* LEFT SECTION: Products & Catalog */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
        {/* Header with Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, whiteSpace: 'nowrap' }}>
            Novo pedido
          </h1>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px', minWidth: 0 }}>
            <Search size={16} color="#9A9089" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar item (ex: xis, coca)"
              style={{
                width: '100%',
                border: '1px solid #E2DBD3',
                background: '#fff',
                borderRadius: '10px',
                padding: '11px 14px 11px 36px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activeCategoriesList.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  border: isSelected ? '1px solid #1F1A17' : '1px solid #E2DBD3',
                  background: isSelected ? '#1F1A17' : '#fff',
                  color: isSelected ? '#fff' : '#1F1A17',
                  borderRadius: '999px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'background 0.15s',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {filteredProducts.map((p) => {
            const qty = getProductTotalInCart(p.id);
            const hasInCart = qty > 0;
            const categoryObj = categories.find((c) => c.id === p.catId);

            return (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p.id)}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  background: '#fff',
                  border: hasInCart ? '1.5px solid #C41F27' : '1.5px solid #ECE6DF',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  minHeight: '118px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  {categoryObj ? categoryObj.name : 'Outros'}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.25 }}>
                  {p.name}
                </span>
                <span style={{ marginTop: 'auto', fontSize: '15px', fontWeight: 800, color: '#C41F27' }}>
                  {formatMoney(p.price)}
                </span>
                {hasInCart && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#C41F27',
                      color: '#fff',
                      borderRadius: '999px',
                      minWidth: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                    }}
                  >
                    {qty}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* RIGHT SECTION: Cart / Comanda Sidebar */}
      <aside
        style={{
          background: '#fff',
          border: '1px solid #ECE6DF',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '22px',
          height: 'calc(100vh - 44px)',
          minHeight: '540px',
        }}
      >
        {/* Comanda Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #F1ECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '16px' }}>Comanda #{orderNum}</strong>
          <div style={{ display: 'flex', background: '#F4F0EB', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            <button
              onClick={() => setOrderType('delivery')}
              style={{
                border: 0,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                background: orderType === 'delivery' ? '#fff' : 'transparent',
                color: orderType === 'delivery' ? '#1F1A17' : '#7A7068',
                boxShadow: orderType === 'delivery' ? '0 1px 2px rgba(31,26,23,.1)' : 'none',
              }}
            >
              Entrega
            </button>
            <button
              onClick={() => setOrderType('balcao')}
              style={{
                border: 0,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                background: orderType === 'balcao' ? '#fff' : 'transparent',
                color: orderType === 'balcao' ? '#1F1A17' : '#7A7068',
                boxShadow: orderType === 'balcao' ? '0 1px 2px rgba(31,26,23,.1)' : 'none',
              }}
            >
              Balcão
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ padding: '6px 18px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ margin: 0, padding: '28px 0', textAlign: 'center', fontSize: '13px', color: '#9A9089' }}>
              Toque nos itens ao lado para adicionar.
            </p>
          ) : (
            cart.map((line) => {
              const product = getProduct(line.productId);
              if (!product) return null;
              const isCustomOpen = openCustomLineKey === line.key;
              const hasIngredients = product.ings && product.ings.length > 0;
              const hasExtras = product.extras && product.extras.length > 0;
              const canCustomize = hasIngredients || hasExtras;
              const lineUnitPrice = getLineUnitPrice(line);
              const lineTotal = lineUnitPrice * line.qty;

              return (
                <div
                  key={line.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: isCustomOpen ? '10px' : '10px 0',
                    margin: isCustomOpen ? '0 -10px' : '0',
                    borderBottom: '1px solid #F4F0EB',
                    borderRadius: '10px',
                    background: isCustomOpen ? '#FFFBF0' : 'transparent',
                    boxShadow: isCustomOpen ? 'inset 0 0 0 1.5px #F5D77A' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Stepper with Lucide */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2DBD3', borderRadius: '8px' }}>
                      <button
                        onClick={() => handleLineQtyChange(line.key, -1)}
                        style={{ border: 0, background: 'none', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                        {line.qty}
                      </span>
                      <button
                        onClick={() => handleLineQtyChange(line.key, 1)}
                        style={{ border: 0, background: 'none', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Item Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.name}</span>
                      {line.added.length > 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#237A33' }}>
                          {line.added.map((e) => '+ ' + e.toLowerCase()).join(', ')}
                        </span>
                      )}
                      {line.removed.length > 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#C41F27' }}>
                          {line.removed.map((r) => 'sem ' + r.toLowerCase()).join(', ')}
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      {formatMoney(lineTotal)}
                    </span>
                  </div>

                  {canCustomize && (
                    <button
                      onClick={() => setOpenCustomLineKey(isCustomOpen ? null : line.key)}
                      style={{
                        alignSelf: 'flex-start',
                        marginLeft: '72px',
                        border: 0,
                        background: 'none',
                        padding: 0,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#C41F27',
                        cursor: 'pointer',
                      }}
                    >
                      {isCustomOpen ? 'Fechar' : 'Personalizar'}
                    </button>
                  )}

                  {/* Customization Accordion */}
                  {isCustomOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAF8F5', borderRadius: '8px', padding: '10px' }}>
                      {hasIngredients && (
                        <>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Tirar
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {product.ings.map((ing) => {
                              const isRemoved = line.removed.includes(ing);
                              return (
                                <button
                                  key={ing}
                                  onClick={() => handleToggleIngredient(line.key, ing)}
                                  style={{
                                    border: isRemoved ? '1px solid #F3B9BC' : '1px solid #E2DBD3',
                                    background: isRemoved ? '#FDECEC' : '#fff',
                                    color: isRemoved ? '#C41F27' : '#4A423C',
                                    textDecoration: isRemoved ? 'line-through' : 'none',
                                    borderRadius: '999px',
                                    padding: '6px 11px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {ing}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {hasExtras && (
                        <>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A7068', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Adicionar
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {product.extras.map(([extraName, extraPrice]) => {
                              const isAdded = line.added.includes(extraName);
                              return (
                                <button
                                  key={extraName}
                                  onClick={() => handleToggleExtra(line.key, extraName)}
                                  style={{
                                    border: isAdded ? '1px solid #9BD3A6' : '1px solid #E2DBD3',
                                    background: isAdded ? '#EAF6EC' : '#fff',
                                    color: isAdded ? '#237A33' : '#4A423C',
                                    borderRadius: '999px',
                                    padding: '6px 11px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    gap: '5px',
                                  }}
                                >
                                  {extraName}
                                  <span style={{ opacity: 0.75 }}>+{formatMoney(extraPrice)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Controls & Checkout */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F1ECE6' }}>
          {/* Phone */}
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            type="tel"
            inputMode="tel"
            placeholder="Telefone do cliente"
            style={{
              border: '1px solid #E2DBD3',
              borderRadius: '8px',
              padding: '9px',
              fontSize: '13px',
              minWidth: 0,
              outline: 'none',
            }}
          />

          {/* Delivery Fields */}
          {orderType === 'delivery' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                style={{
                  border: '1px solid #E2DBD3',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '13px',
                  background: '#fff',
                  outline: 'none',
                }}
              >
                {bairros
                  .filter((b) => b.active || b.name === selectedBairro)
                  .map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} · {formatMoney(b.fee)}
                    </option>
                  ))}
              </select>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua e número"
                style={{
                  border: '1px solid #E2DBD3',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '13px',
                  minWidth: 0,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Payment Methods */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '5px' }}>
            {['PIX', 'Crédito', 'Débito', 'Dinheiro', 'Fiado'].map((m) => {
              const isSelected = paymentMethod === m;
              return (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    border: isSelected ? '1.5px solid #F5B800' : '1.5px solid #E2DBD3',
                    background: isSelected ? '#FFF6DB' : '#fff',
                    color: '#1F1A17',
                    borderRadius: '8px',
                    padding: '9px 0',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Fiado extra field */}
          {paymentMethod === 'Fiado' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#FFF6DB', borderRadius: '8px', padding: '10px' }}>
              <input
                value={fiadoName}
                onChange={(e) => {
                  setFiadoName(e.target.value);
                  setFiadoError(false);
                }}
                placeholder="Quem pediu? (nome)"
                style={{
                  border: fiadoError ? '1px solid #C41F27' : '1px solid #E9D18A',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '13px',
                  minWidth: 0,
                  background: '#fff',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '12px', color: '#7A5A00' }}>
                O pedido fica registrado e o valor vai para "A receber".
              </span>
            </div>
          )}

          {/* Cash Change extra field */}
          {paymentMethod === 'Dinheiro' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="Valor recebido"
                style={{
                  flex: 1,
                  border: '1px solid #E2DBD3',
                  borderRadius: '8px',
                  padding: '9px',
                  fontSize: '13px',
                  minWidth: 0,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2F7A3B' }}>
                Troco {formatMoney(changeValue)}
              </span>
            </div>
          )}

          {/* Subtotal & Delivery values */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#6E655E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Entrega</span>
              <span>{formatMoney(deliveryFee)}</span>
            </div>
          </div>

          {/* Buttons */}
          {cart.length > 0 && (
            <button
              onClick={handlePreview}
              style={{
                border: '1px solid #E2DBD3',
                background: '#fff',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1F1A17',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Printer size={15} /> Visualizar impressão
            </button>
          )}

          <button
            onClick={handleFinish}
            disabled={cart.length === 0}
            style={{
              border: 0,
              background: cart.length > 0 ? '#C41F27' : '#D6CFC7',
              color: '#fff',
              borderRadius: '10px',
              padding: '15px 18px',
              fontSize: '16px',
              fontWeight: 800,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} />
              <span>{cart.length > 0 ? 'Enviar pedido' : 'Adicione itens'}</span>
            </div>
            <span>{formatMoney(grandTotal)}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
