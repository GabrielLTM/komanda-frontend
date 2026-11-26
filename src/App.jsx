import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import NovoPedido from './components/NovoPedido';
import QuadroPedidos from './components/QuadroPedidos';
import CardapioAdmin from './components/CardapioAdmin';
import CategoriasAdmin from './components/CategoriasAdmin';
import MotoboysAdmin from './components/MotoboysAdmin';
import BairrosAdmin from './components/BairrosAdmin';
import CaixaRelatorios from './components/CaixaRelatorios';
import OrderDetailModal from './components/OrderDetailModal';
import CategoryModal from './components/CategoryModal';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import { api } from './services/api';

// Intervalo da atualização automática dos dados.
const REFRESH_INTERVAL_MS = 10000;

export default function App() {
  const [activeTab, setActiveTab] = useState('pedido');
  const [customizationProductId, setCustomizationProductId] = useState(null);
  const [returnToOrder, setReturnToOrder] = useState(false);
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
  const [motoboys, setMotoboys] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersAvailable, setOrdersAvailable] = useState(false);

  // Cart & Order state
  const [cart, setCart] = useState([]);

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
      // Pedidos carregam à parte: se a API de pedidos não estiver publicada, os cadastros seguem funcionando.
      const [online, cats, prods, mb, areas, pedidos] = await Promise.all([
        api.health(), api.getCategorias(), api.getProdutos(), api.getMotoboys(), api.getBairros(), api.getPedidos().catch(() => null),
      ]);
      if (sequence !== loadSequence.current) return;
      if (!online) throw new Error('O servidor não está disponível. Tente novamente.');
      setCategories(cats.sort((a, b) => a.ordem - b.ordem));
      setProducts(prods);
      setMotoboys(mb);
      setBairros(areas);
      setOrders(pedidos ?? []);
      setOrdersAvailable(pedidos !== null);
    } catch (err) {
      if (sequence === loadSequence.current) setLoadError(err.message || 'Não foi possível carregar os cadastros.');
    } finally {
      if (sequence === loadSequence.current) setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Atualização silenciosa: traz o que outros atendentes mudaram, sem recarregar a página.
  // Roda a cada intervalo e quando a aba volta a ficar visível; descarta o resultado
  // se uma gravação aconteceu no meio, para não sobrescrever o que acabou de ser salvo.
  const refreshSequence = useRef(0);
  const dataVersion = useRef(0);
  const refreshData = async () => {
    if (mutationLock.current || document.hidden) return;
    const sequence = ++refreshSequence.current;
    const version = dataVersion.current;
    try {
      const [cats, prods, mb, areas, pedidos] = await Promise.all([
        api.getCategorias(), api.getProdutos(), api.getMotoboys(), api.getBairros(), api.getPedidos().catch(() => null),
      ]);
      if (sequence !== refreshSequence.current || version !== dataVersion.current) return;
      setCategories(cats.sort((a, b) => a.ordem - b.ordem));
      setProducts(prods);
      setMotoboys(mb);
      setBairros(areas);
      if (pedidos !== null) setOrders((prev) => pedidos.map((o) => ({ ...o, fiadoPaid: prev.find((p) => p.id === o.id)?.fiadoPaid ?? false })));
      setOrdersAvailable(pedidos !== null);
      setLoadError('');
    } catch {
      // Falha passageira de rede: a próxima rodada tenta de novo.
    }
  };

  useEffect(() => {
    const timer = setInterval(refreshData, REFRESH_INTERVAL_MS);
    const onVisible = () => { if (!document.hidden) refreshData(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  const runMutation = async (action) => {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    dataVersion.current += 1;
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

  // A API numera os pedidos por noite; aqui é só a previsão do próximo número.
  const orderNum = orders.reduce((max, o) => Math.max(max, o.num), 0) + 1;
  const openOrdersCount = orders.filter((o) => o.status === 'prod' || o.status === 'ready').length;

  const handleFinishOrder = (data) => runMutation(async () => {
    const created = await api.createPedido({ ...data, waitMinutes });
    setOrders((prev) => [...prev, created]);
    setCart([]);
    showToast(`Pedido #${created.num} enviado para a cozinha.`);
  });

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

  const replaceOrder = (num, patch) => {
    setOrders((prev) => prev.map((o) => (o.num === num ? { ...o, ...patch } : o)));
    setDetailOrder((prev) => (prev && prev.num === num ? { ...prev, ...patch } : prev));
  };

  const handleUpdateOrder = (num, patch) => {
    const order = orders.find((o) => o.num === num);
    if (!order) return;
    // Status e motoboy são gravados na API; o recebimento do fiado ainda é só local.
    if (patch.status !== undefined) {
      return runMutation(async () => {
        const updated = await api.updatePedidoStatus(order.id, patch.status);
        replaceOrder(num, { ...updated, fiadoPaid: order.fiadoPaid });
      });
    }
    if (patch.moto !== undefined) {
      return runMutation(async () => {
        const updated = await api.updatePedidoMotoboy(order.id, patch.moto);
        replaceOrder(num, { ...updated, fiadoPaid: order.fiadoPaid });
      });
    }
    replaceOrder(num, patch);
  };

  // Cancelar mantém o registro (fica fora do quadro); excluir apaga um pedido lançado por engano.
  // Devolvem null quando deu certo ou a mensagem de erro para a janela do pedido mostrar.
  const handleCancelOrder = async (num) => {
    const order = orders.find((o) => o.num === num);
    if (!order) return 'Pedido não encontrado. Atualize a tela.';
    try {
      const updated = await api.updatePedidoStatus(order.id, 'cancelled');
      replaceOrder(num, { ...updated, fiadoPaid: order.fiadoPaid });
      setDetailOrder(null);
      showToast(`Pedido #${num} cancelado.`);
      return null;
    } catch (err) {
      return err.message || 'Não foi possível cancelar o pedido.';
    }
  };

  const handleDeleteOrder = async (num) => {
    const order = orders.find((o) => o.num === num);
    if (!order) return 'Pedido não encontrado. Atualize a tela.';
    try {
      await api.deletePedido(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setDetailOrder(null);
      showToast(`Pedido #${num} excluído.`);
      return null;
    } catch (err) {
      return err.message || 'Não foi possível excluir o pedido.';
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
        setCustomizationProductId(created.id);
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

  const handlePatchCategory = (id, changes) => runMutation(async () => {
    const updated = await api.updateCategoria(id, changes);
    setCategories((prev) => prev.map((item) => item.id === id ? updated : item));
    showToast('Base da categoria atualizada.');
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


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1fr)', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={openOrdersCount}
        waitMinutes={waitMinutes}
        setWaitMinutes={setWaitMinutes}
      />

      {/* Main Content Area */}
      <main style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0, flex: 1 }}>
        {isLoading && <div role="status" style={{ padding: '8px 12px', color: '#4A423C' }}>Carregando cadastros do servidor…</div>}
        {loadError && <div role="alert" style={{ background: '#FFF0F0', color: '#8C141B', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}><span>{loadError}</span><button type="button" onClick={loadData} disabled={isLoading}>Tentar novamente</button></div>}
        {!isLoading && !loadError && !ordersAvailable && <div role="status" style={{ background: '#FFF6DB', color: '#6F5200', border: '1px solid #E9D18A', borderRadius: '8px', padding: '10px 14px' }}>O registro de pedidos não está disponível no servidor no momento.</div>}
        {mutationError && <div role="alert" style={{ background: '#FFF0F0', color: '#8C141B', border: '1px solid #E7A7AA', borderRadius: '8px', padding: '12px 14px' }}>{mutationError}</div>}
        <div hidden={activeTab !== 'pedido'}>
          <NovoPedido
            products={products}
            categories={categories}
            bairros={bairros}
            cart={cart}
            setCart={setCart}
            orderNum={orderNum}
            onFinishOrder={handleFinishOrder}
            onPreviewCart={handlePreviewCart}
            orderPersistenceAvailable={ordersAvailable}
            busy={mutationBusy}
            onConfigureProduct={(id) => {
              setCustomizationProductId(id);
              setReturnToOrder(true);
              setActiveTab('cardapio');
            }}
          />
        </div>

        {activeTab === 'quadro' && (
          <QuadroPedidos
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            motoboys={motoboys}
            onOpenDetail={handleOpenOrderDetail}
            waitMinutes={waitMinutes}
          />
        )}

        {activeTab === 'cardapio' && (
          <CardapioAdmin
            initialExpandedProductId={customizationProductId}
            onReturnToOrder={returnToOrder ? () => {
              setReturnToOrder(false);
              setCustomizationProductId(null);
              setActiveTab('pedido');
            } : null}
            products={products}
            categories={categories}
            onOpenNewProduct={() => setProductModal({ open: true, product: null })}
            onEditProduct={(prod) => setProductModal({ open: true, product: prod })}
            busy={mutationBusy}
            onPatchProduct={handlePatchProduct}
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
            onPatchCategory={handlePatchCategory}
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
          onCancelOrder={handleCancelOrder}
          onDeleteOrder={handleDeleteOrder}
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
