import React, { useState, useEffect, useRef } from 'react';
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
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('pedido');
  const [waitMinutes, setWaitMinutes] = useState('40');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mutationBusy, setMutationBusy] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const mutationLock = useRef(false);
  const loadSequence = useRef(0);

  // Entities state
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [motoboys, setMotoboys] = useState([]);
  const [bairros, setBairros] = useState([]);
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

  const loadData = async () => {
    const sequence = ++loadSequence.current;
    setIsLoading(true);
    setLoadError('');
    try {
      const [online, cats, prods, mb, areas] = await Promise.all([
        api.health(), api.getCategorias(), api.getProdutos(), api.getMotoboys(), api.getBairros(),
      ]);
      if (sequence !== loadSequence.current) return;
      if (!online) throw new Error('O servidor não está disponível. Tente novamente.');
      setCategories(cats.sort((a, b) => a.ordem - b.ordem));
      setProducts(prods);
      setMotoboys(mb);
      setBairros(areas);
    } catch (err) {
      if (sequence === loadSequence.current) setLoadError(err.message || 'Não foi possível carregar os cadastros.');
    } finally {
      if (sequence === loadSequence.current) setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const runMutation = async (action) => {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setMutationBusy(true);
    setMutationError('');
    try {
      await action();
      return true;
    } catch (err) {
      setMutationError(err.message || 'Não foi possível salvar. Tente novamente.');
      return false;
    } finally {
      mutationLock.current = false;
      setMutationBusy(false);
    }
  };

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

  const handleFinishOrder = () => {
    showToast('O registro de pedidos ainda não está disponível; a comanda foi mantida como rascunho.');
    return false;
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

  const handleSaveCategory = async (catData) => {
    return runMutation(async () => {
      if (catData.id) {
        const updated = await api.updateCategoria(catData.id, { name: catData.name });
        setCategories((prev) => prev.map((category) => category.id === updated.id ? updated : category).sort((a, b) => a.ordem - b.ordem));
        showToast('Categoria atualizada com sucesso.');
      } else {
        const created = await api.createCategoria({ name: catData.name, ordem: categories.length + 1 });
        setCategories((prev) => [...prev, created].sort((a, b) => a.ordem - b.ordem));
        showToast('Categoria criada com sucesso.');
      }
      setCategoryModal({ open: false, category: null });
    });
  };

  const handleSaveProduct = async (prodData) => {
    return runMutation(async () => {
      if (prodData.id) {
        const updated = await api.updateProduto(prodData.id, prodData);
        setProducts((prev) => prev.map((product) => product.id === updated.id ? updated : product));
        showToast('Produto atualizado com sucesso.');
      } else {
        const created = await api.createProduto(prodData);
        setProducts((prev) => [...prev, created]);
        showToast('Produto cadastrado com sucesso.');
      }
      setProductModal({ open: false, product: null });
    });
  };

  const handleDeleteProduct = async (prod) => {
    return runMutation(async () => {
      await api.deleteProduto(prod.id);
      setProducts((prev) => prev.filter((product) => product.id !== prod.id));
      setProductModal({ open: false, product: null });
      showToast('Produto excluído.');
    });
  };

  const handleAddCategoryFromProduct = async (categoryName) => {
    const existing = categories.find(
      (c) => c.name.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    let resultId = null;
    const saved = await runMutation(async () => {
      if (existing) {
        if (existing.active === false) {
          const updated = await api.updateCategoria(existing.id, { active: true });
          setCategories((prev) => prev.map((category) => category.id === updated.id ? updated : category));
        }
        resultId = existing.id;
        return;
      }
      const created = await api.createCategoria({ name: categoryName.trim(), ordem: categories.length + 1 });
      setCategories((prev) => [...prev, created].sort((a, b) => a.ordem - b.ordem));
      resultId = created.id;
    });
    return saved ? resultId : null;
  };

  const handleToggleCategory = (id) => runMutation(async () => {
    const category = categories.find((item) => item.id === id);
    if (!category) throw new Error('Categoria não encontrada. Atualize a lista e tente novamente.');
    const updated = await api.updateCategoria(id, { active: category.active === false });
    setCategories((prev) => prev.map((item) => item.id === id ? updated : item));
    showToast(updated.active ? 'Categoria ativada.' : 'Categoria desativada.');
  });

  const handleReorderCategories = (ids) => runMutation(async () => {
    const updated = await api.reordenarCategorias(ids);
    setCategories(updated.sort((a, b) => a.ordem - b.ordem));
    showToast('Ordem das categorias atualizada.');
  });

  const handleDeleteCategory = (id) => runMutation(async () => {
    await api.deleteCategoria(id);
    setCategories((prev) => prev.filter((item) => item.id !== id));
    showToast('Categoria excluída.');
  });

  const handlePatchProduct = (id, changes) => runMutation(async () => {
    const updated = await api.updateProduto(id, changes);
    setProducts((prev) => prev.map((item) => item.id === id ? updated : item));
    showToast('Produto atualizado.');
  });

  const handleCreateBairro = (data) => runMutation(async () => {
    const created = await api.createBairro(data);
    setBairros((prev) => [...prev, created]);
    showToast('Bairro cadastrado com sucesso.');
  });

  const handleUpdateBairro = (id, data) => runMutation(async () => {
    const updated = await api.updateBairro(id, data);
    setBairros((prev) => prev.map((item) => item.id === id ? updated : item));
    showToast('Bairro atualizado.');
  });

  const handleDeleteBairro = (id) => runMutation(async () => {
    await api.deleteBairro(id);
    setBairros((prev) => prev.filter((item) => item.id !== id));
    showToast('Bairro excluído.');
  });

  const handleCreateMotoboy = (data) => runMutation(async () => {
    const created = await api.createMotoboy(data);
    setMotoboys((prev) => [...prev, created]);
    showToast('Motoboy cadastrado com sucesso.');
  });

  const handleUpdateMotoboy = (id, data) => runMutation(async () => {
    const updated = await api.updateMotoboy(id, data);
    setMotoboys((prev) => prev.map((item) => item.id === id ? updated : item));
    showToast('Cadastro de motoboy atualizado.');
  });

  const handleDeleteMotoboy = (id) => runMutation(async () => {
    await api.deleteMotoboy(id);
    setMotoboys((prev) => prev.filter((item) => item.id !== id));
    showToast('Motoboy excluído.');
  });

  const demoTabs = ['pedido', 'quadro', 'estoque', 'caixa'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1fr)', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={0}
        waitMinutes={waitMinutes}
        setWaitMinutes={setWaitMinutes}
      />

      {/* Main Content Area */}
      <main style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0, flex: 1 }}>
        {isLoading && <div role="status" style={{ padding: '8px 12px', color: '#4A423C' }}>Carregando cadastros do servidor…</div>}
        {loadError && <div role="alert" style={{ background: '#FFF0F0', color: '#8C141B', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}><span>{loadError}</span><button type="button" onClick={loadData} disabled={isLoading}>Tentar novamente</button></div>}
        {mutationError && <div role="alert" style={{ background: '#FFF0F0', color: '#8C141B', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '12px 14px' }}>{mutationError}</div>}
        {demoTabs.includes(activeTab) && <div role="status" style={{ background: '#FFF6DB', color: '#6F5200', border: '1px solid #E9D18A', borderRadius: '8px', padding: '10px 14px' }}>Demonstração local: pedidos, quadro, estoque e caixa ainda não são gravados no servidor.</div>}
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
            orderPersistenceAvailable={false}
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
            categories={categories}
            onOpenNewProduct={() => setProductModal({ open: true, product: null })}
            onEditProduct={(prod) => setProductModal({ open: true, product: prod })}
            busy={mutationBusy}
            onPatchProduct={handlePatchProduct}
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
            products={products}
            onOpenNewCategory={() => setCategoryModal({ open: true, category: null })}
            onEditCategory={(cat) => setCategoryModal({ open: true, category: cat })}
            busy={mutationBusy}
            error={mutationError}
            onToggleCategory={handleToggleCategory}
            onReorderCategories={handleReorderCategories}
            onDeleteCategory={handleDeleteCategory}
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
            bairros={bairros}
            busy={mutationBusy}
            error={mutationError}
            defaultDailyFee={0}
            onCreate={handleCreateMotoboy}
            onUpdate={handleUpdateMotoboy}
            onDelete={handleDeleteMotoboy}
          />
        )}

        {activeTab === 'bairros' && (
          <BairrosAdmin
            bairros={bairros}
            busy={mutationBusy}
            error={mutationError}
            onCreate={handleCreateBairro}
            onUpdate={handleUpdateBairro}
            onDelete={handleDeleteBairro}
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
          busy={mutationBusy}
          error={mutationError}
        />
      )}

      {productModal.open && (
        <ProductModal
          productToEdit={productModal.product}
          categories={categories}
          onClose={() => setProductModal({ open: false, product: null })}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
          onAddCategory={handleAddCategoryFromProduct}
          error={mutationError}
        />
      )}

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
