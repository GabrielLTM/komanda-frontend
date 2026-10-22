const optionalBaseUrl = import.meta.env?.VITE_API_URL;

function finiteNumber(value, label) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`O campo ${label} recebido do servidor é inválido.`);
  return parsed;
}

function expectArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`A lista de ${label} recebida do servidor é inválida.`);
  return value;
}

export const mapCategoryFromApi = (category) => ({
  id: finiteNumber(category.id, 'id da categoria'),
  name: category.nome,
  active: category.ativo,
  ordem: category.ordem,
});

export const mapProductFromApi = (product) => ({
  id: finiteNumber(product.id, 'id do produto'),
  catId: finiteNumber(product.categoria?.id ?? product.categoriaId, 'categoria do produto'),
  name: product.nome,
  price: finiteNumber(product.preco, 'preço do produto'),
  desc: product.descricao ?? '',
  active: product.ativo,
  ings: Array.isArray(product.ingredientes) ? [...product.ingredientes] : [],
  extras: expectArray(product.adicionais ?? [], 'adicionais').map((additional) => [
    additional.nome,
    finiteNumber(additional.preco, 'preço do adicional'),
  ]),
});

export const mapNeighborhoodFromApi = (neighborhood) => ({
  id: finiteNumber(neighborhood.id, 'id do bairro'),
  name: neighborhood.nome,
  fee: finiteNumber(neighborhood.taxaEntrega, 'taxa do bairro'),
  active: neighborhood.ativo,
});

export const mapMotoboyFromApi = (motoboy) => ({
  id: finiteNumber(motoboy.id, 'id do motoboy'),
  name: motoboy.nome,
  phone: motoboy.telefone ?? '',
  baseFee: finiteNumber(motoboy.valorFixoNoite, 'diária do motoboy'),
  active: motoboy.ativo,
});

export const productToApi = (product) => {
  const payload = {};
  if (product.name !== undefined) payload.nome = product.name;
  if (product.catId !== undefined) payload.categoriaId = product.catId;
  if (product.price !== undefined) payload.preco = finiteNumber(product.price, 'preço do produto');
  if (product.desc !== undefined) payload.descricao = String(product.desc).trim() || null;
  if (product.active !== undefined) payload.ativo = product.active;
  if (product.ings !== undefined) payload.ingredientes = [...product.ings];
  if (product.extras !== undefined) {
    payload.adicionais = product.extras.map(([nome, preco]) => ({ nome, preco: finiteNumber(preco, 'preço do adicional') }));
  }
  return payload;
};

function normalizeBaseUrl(value) {
  return value.replace(/\/$/, '');
}

export function createApi({ baseUrl = optionalBaseUrl || '/api', fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('A API precisa de uma implementação de fetch.');
  const base = normalizeBaseUrl(baseUrl);
  const origin = globalThis.location?.origin || 'http://localhost';
  const resolveUrl = (path) => new URL(`${base}${path}`, origin);
  const resolveHealthUrl = () => {
    if (/^https?:\/\//i.test(base)) return new URL('/health', base);
    return new URL('/health', origin);
  };

  async function request(method, path, body) {
    const url = resolveUrl(path);
    const res = await fetchImpl(url.toString(), {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (res.status === 204) return null;
    let json;
    try {
      json = await res.json();
    } catch {
      if (!res.ok) throw new Error(`Não foi possível concluir a solicitação (${res.status}).`);
      throw new Error('O servidor enviou uma resposta inválida.');
    }
    if (!res.ok) {
      const message = json?.erro ?? json?.message ?? json?.error;
      throw new Error(typeof message === 'string' ? message : `Não foi possível concluir a solicitação (${res.status}).`);
    }
    return json;
  }

  const collection = async (path, mapper) => expectArray(await request('GET', path), path).map(mapper);
  const areaQuery = (activeOnly) => activeOnly ? '?ativo=true' : '';

  return {
    async health() {
      const url = resolveHealthUrl();
      const response = await fetchImpl(url.toString());
      return response.ok;
    },
    async getCategorias(apenasAtivas = false) { return collection(`/categorias${areaQuery(apenasAtivas)}`, mapCategoryFromApi); },
    async getCategoriaById(id) { return mapCategoryFromApi(await request('GET', `/categorias/${id}`)); },
    async createCategoria(data) { return mapCategoryFromApi(await request('POST', '/categorias', { nome: data.name, ordem: data.ordem })); },
    async updateCategoria(id, data) {
      const payload = {};
      if (data.name !== undefined) payload.nome = data.name;
      if (data.active !== undefined) payload.ativo = data.active;
      if (data.nome !== undefined) payload.nome = data.nome;
      if (data.ativo !== undefined) payload.ativo = data.ativo;
      return mapCategoryFromApi(await request('PATCH', `/categorias/${id}`, payload));
    },
    async reordenarCategorias(ids) { return expectArray(await request('PATCH', '/categorias/ordem', { ids }), 'categorias').map(mapCategoryFromApi); },
    async deleteCategoria(id) { return request('DELETE', `/categorias/${id}`); },

    async getProdutos(filtros = {}) {
      const params = new URLSearchParams();
      if (filtros.categoriaId !== undefined) params.set('categoriaId', filtros.categoriaId);
      if (filtros.ativo !== undefined) params.set('ativo', String(filtros.ativo));
      const suffix = params.size ? `?${params}` : '';
      return collection(`/produtos${suffix}`, mapProductFromApi);
    },
    async getProdutoById(id) { return mapProductFromApi(await request('GET', `/produtos/${id}`)); },
    async createProduto(data) { return mapProductFromApi(await request('POST', '/produtos', productToApi(data))); },
    async updateProduto(id, data) { return mapProductFromApi(await request('PATCH', `/produtos/${id}`, productToApi(data))); },
    async deleteProduto(id) { return request('DELETE', `/produtos/${id}`); },
    async getCardapio() { return request('GET', '/cardapio'); },

    async getBairros(apenasAtivas = false) { return collection(`/bairros${areaQuery(apenasAtivas)}`, mapNeighborhoodFromApi); },
    async getBairroById(id) { return mapNeighborhoodFromApi(await request('GET', `/bairros/${id}`)); },
    async createBairro(data) { return mapNeighborhoodFromApi(await request('POST', '/bairros', { nome: data.name, taxaEntrega: finiteNumber(data.fee, 'taxa de entrega') })); },
    async updateBairro(id, data) {
      const payload = {};
      if (data.name !== undefined) payload.nome = data.name;
      if (data.fee !== undefined) payload.taxaEntrega = finiteNumber(data.fee, 'taxa de entrega');
      if (data.active !== undefined) payload.ativo = data.active;
      return mapNeighborhoodFromApi(await request('PATCH', `/bairros/${id}`, payload));
    },
    async deleteBairro(id) { return request('DELETE', `/bairros/${id}`); },

    async getMotoboys(apenasAtivos = false) { return collection(`/motoboys${areaQuery(apenasAtivos)}`, mapMotoboyFromApi); },
    async getMotoboyById(id) { return mapMotoboyFromApi(await request('GET', `/motoboys/${id}`)); },
    async createMotoboy(data) {
      return mapMotoboyFromApi(await request('POST', '/motoboys', {
        nome: data.name,
        telefone: data.phone ?? '',
        ...(data.baseFee === undefined ? {} : { valorFixoNoite: finiteNumber(data.baseFee, 'diária do motoboy') }),
        ativo: true,
      }));
    },
    async updateMotoboy(id, data) {
      const payload = {};
      if (data.name !== undefined) payload.nome = data.name;
      if (data.phone !== undefined) payload.telefone = data.phone;
      if (data.baseFee !== undefined) payload.valorFixoNoite = finiteNumber(data.baseFee, 'diária do motoboy');
      if (data.active !== undefined) payload.ativo = data.active;
      return mapMotoboyFromApi(await request('PATCH', `/motoboys/${id}`, payload));
    },
    async deleteMotoboy(id) { return request('DELETE', `/motoboys/${id}`); },
  };
}

export const api = createApi();
