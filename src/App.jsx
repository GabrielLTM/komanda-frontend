import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NovoPedido from './components/NovoPedido';
import QuadroPedidos from './components/QuadroPedidos';
import CardapioAdmin from './components/CardapioAdmin';
import ConsultaCardapio from './components/ConsultaCardapio';
import CategoriasAdmin from './components/CategoriasAdmin';
import EstoqueAdmin from './components/EstoqueAdmin';
import MotoboysAdmin from './components/MotoboysAdmin';
import BairrosAdmin from './components/BairrosAdmin';
import CaixaRelatorios from './components/CaixaRelatorios';
import OrderDetailModal from './components/OrderDetailModal';
import CategoryModal from './components/CategoryModal';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import { api } from './services/api';

import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_MOTOBOYS,
  INITIAL_BAIRROS,
  INITIAL_ORDERS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('pedido');
  const [waitMinutes, setWaitMinutes] = useState('40');

  // Estado do backend
  const [backendOnline, setBackendOnline] = useState(false);

  // Entities state
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [motoboys, setMotoboys] = useState(INITIAL_MOTOBOYS);
  const [bairros, setBairros] = useState(INITIAL_BAIRROS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Cart & Order state
  const [cart, setCart] = useState([]);
  const [orderNum, setOrderNum] = useState(106);

  // Modals & Feedback
  const [detailOrder, setDetailOrder] = useState(null);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Carregar categorias do backend na inicialização
  useEffect(() => {
    api.health()
      .then((ok) => {
        if (!ok) return;
        setBackendOnline(true);
        return api.getCategorias();
      })
      .then((data) => {
        if (!data) return; // backend offline, usa dados locais
        // Mapeia resposta do backend para o formato do frontend
        const mapped = data.map((c) => ({
          id: c.id,
          name: c.nome,
          active: c.ativo,
          ordem: c.ordem,
        }));
        // Ordena por campo `ordem` vindo do banco
        mapped.sort((a, b) => a.ordem - b.ordem);
        setCategories(mapped);
      })
      .catch(() => {
        // Backend inacessível — mantém dados locais
      });
  }, []);

  // Keyboard shortcuts (F1 = Novo pedido, F2 = Cardápio, Esc = fechar modais)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pedido');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('cardapio');
      } else if (e.key === 'Escape') {
        setDetailOrder(null);
        setCategoryModal({ open: false, category: null });
        setProductModal({ open: false, product: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Finishing an order
  const handleFinishOrder = (orderDoc) => {
    setOrders((prev) => [...prev, { ...orderDoc, status: 'prod' }]);
    setCart([]);
    setOrderNum((prev) => prev + 1);
    showToast('Pedido enviado para a cozinha');
  };

  // Opening detail/print preview for an existing order or cart
  const handleOpenOrderDetail = (num) => {
    const found = orders.find((o) => o.num === num);
    if (found) {
      setDetailOrder(found);
    }
  };

  const handlePreviewCart = (cartDoc) => {
    setDetailOrder(cartDoc);
  };

  const handleUpdateOrder = (num, patch) => {
    setOrders((prev) =>
      prev.map((o) => (o.num === num ? { ...o, ...patch } : o))
    );
    if (detailOrder && detailOrder.num === num) {
      setDetailOrder((prev) => ({ ...prev, ...patch }));
    }
  };

  // Category modal actions
  const handleSaveCategory = async (catData) => {
    try {
      if (catData.id) {
        // Edit
        if (backendOnline) {
          const updated = await api.updateCategoria(catData.id, { nome: catData.name });
          setCategories((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, name: updated.nome, active: updated.ativo } : c))
          );
        } else {
          setCategories((prev) =>
            prev.map((c) => (c.id === catData.id ? { ...c, name: catData.name } : c))
          );
        }
        showToast('Categoria atualizada com sucesso');
      } else {
        // Create
        if (backendOnline) {
          const ordem = categories.length + 1;
          const created = await api.createCategoria({ nome: catData.name, ordem });
          setCategories((prev) => [...prev, { id: created.id, name: created.nome, active: created.ativo, ordem: created.ordem }]);
        } else {
          const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
          setCategories((prev) => [...prev, { id: newId, name: catData.name, active: true }]);
        }
        showToast('Categoria criada com sucesso');
      }
    } catch (err) {
      showToast('Erro ao salvar categoria: ' + err.message);
    }
    setCategoryModal({ open: false, category: null });
  };

  // Product modal actions
  const handleSaveProduct = (prodData) => {
    if (prodData.id) {
      // Edit
      setProducts((prev) =>
        prev.map((p) => (p.id === prodData.id ? prodData : p))
      );
      showToast('Produto atualizado com sucesso');
    } else {
      // Create
      const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts((prev) => [...prev, { ...prodData, id: newId }]);
      showToast('Produto cadastrado com sucesso');
    }
    setProductModal({ open: false, product: null });
  };

  const handleAddCategoryFromProduct = (categoryName) => {
    const existing = categories.find(
      (c) => c.name.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (existing) {
      if (existing.active === false) {
        setCategories((prev) =>
          prev.map((c) => (c.id === existing.id ? { ...c, active: true } : c))
        );
      }
      return existing.id;
    }
    const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
    setCategories((prev) => [...prev, { id: newId, name: categoryName.trim(), active: true }]);
    return newId;
  };

  const activeOrdersCount = orders.filter((o) => o.status !== 'done').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1fr)', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={activeOrdersCount}
        waitMinutes={waitMinutes}
        setWaitMinutes={setWaitMinutes}
      />

      {/* Main Content Area */}
      <main style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0, flex: 1 }}>
        {activeTab === 'pedido' && (
          <NovoPedido
            products={products}
            categories={categories}
            bairros={bairros}
            cart={cart}
            setCart={setCart}
            orderNum={orderNum}
            onFinishOrder={handleFinishOrder}
            onPreviewCart={handlePreviewCart}
          />
        )}

        {activeTab === 'quadro' && (
          <QuadroPedidos
            orders={orders}
            setOrders={setOrders}
            motoboys={motoboys}
            onOpenDetail={handleOpenOrderDetail}
          />
        )}

        {activeTab === 'cardapio' && (
          <CardapioAdmin
            products={products}
            setProducts={setProducts}
            categories={categories}
            onOpenNewProduct={() => setProductModal({ open: true, product: null })}
            onEditProduct={(prod) => setProductModal({ open: true, product: prod })}
          />
        )}

        {activeTab === 'consulta' && (
          <ConsultaCardapio
            products={products}
            categories={categories}
          />
        )}

        {activeTab === 'categorias' && (
          <CategoriasAdmin
            categories={categories}
            setCategories={setCategories}
            products={products}
            onOpenNewCategory={() => setCategoryModal({ open: true, category: null })}
            onEditCategory={(cat) => setCategoryModal({ open: true, category: cat })}
            backendOnline={backendOnline}
            showToast={showToast}
          />
        )}

        {activeTab === 'estoque' && (
          <EstoqueAdmin
            inventory={inventory}
            setInventory={setInventory}
          />
        )}

        {activeTab === 'motoboy' && (
          <MotoboysAdmin
            motoboys={motoboys}
            setMotoboys={setMotoboys}
            orders={orders}
            bairros={bairros}
          />
        )}

        {activeTab === 'bairros' && (
          <BairrosAdmin
            bairros={bairros}
            setBairros={setBairros}
          />
        )}

        {activeTab === 'caixa' && (
          <CaixaRelatorios
            orders={orders}
          />
        )}
      </main>

      {/* MODALS */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          motoboys={motoboys}
          onClose={() => setDetailOrder(null)}
          onUpdateOrder={handleUpdateOrder}
          onPrintToast={(msg) => showToast(msg)}
        />
      )}

      {categoryModal.open && (
        <CategoryModal
          categoryToEdit={categoryModal.category}
          categories={categories}
          onClose={() => setCategoryModal({ open: false, category: null })}
          onSave={handleSaveCategory}
        />
      )}

      {productModal.open && (
        <ProductModal
          productToEdit={productModal.product}
          categories={categories}
          onClose={() => setProductModal({ open: false, product: null })}
          onSave={handleSaveProduct}
          onAddCategory={handleAddCategoryFromProduct}
        />
      )}

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
