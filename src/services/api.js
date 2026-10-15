// Base URL: em dev, o proxy do Vite redireciona /api -> http://localhost:3000/api
// Em producao, aponte VITE_API_URL para a URL real do servidor.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Utilitario interno
async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  if (res.status === 204) return null; // sem conteudo (DELETE bem-sucedido)

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const mensagem = (json && (json.erro || json.message)) || `Erro ${res.status}`;
    throw new Error(mensagem);
  }

  return json;
}

export const api = {

  // Saude do servidor
  async health() {
    const res = await fetch('/health');
    return res.ok;
  },

  // US01 - Categorias
  async getCategorias(apenasAtivas = false) {
    const qs = apenasAtivas ? '?ativo=true' : '';
    return request('GET', `/categorias${qs}`);
  },

  async getCategoriaById(id) {
    return request('GET', `/categorias/${id}`);
  },

  async createCategoria(data) {
    return request('POST', '/categorias', data);
  },

  async updateCategoria(id, data) {
    return request('PATCH', `/categorias/${id}`, data);
  },

  async reordenarCategorias(ids) {
    return request('PATCH', '/categorias/ordem', { ids });
  },

  async deleteCategoria(id) {
    return request('DELETE', `/categorias/${id}`);
  },

  // US02 - Produtos
  async getProdutos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId);
    if (filtros.ativo !== undefined) params.set('ativo', String(filtros.ativo));
    const qs = params.toString() ? `?${params}` : '';
    return request('GET', `/produtos${qs}`);
  },

  async getProdutoById(id) {
    return request('GET', `/produtos/${id}`);
  },

  async createProduto(data) {
    return request('POST', '/produtos', data);
  },

  async updateProduto(id, data) {
    return request('PATCH', `/produtos/${id}`, data);
  },

  async deleteProduto(id) {
    return request('DELETE', `/produtos/${id}`);
  },

  // Cardapio completo (categorias + produtos ativos)
  async getCardapio() {
    return request('GET', '/cardapio');
  },

  // Pedidos
  async getPedidos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.status) params.set('status', filtros.status);
    const qs = params.toString() ? `?${params}` : '';
    return request('GET', `/pedidos${qs}`);
  },

  async createPedido(pedido) {
    return request('POST', '/pedidos', pedido);
  },

  async updatePedidoStatus(id, status) {
    return request('PATCH', `/pedidos/${id}/status`, { status });
  },
};


