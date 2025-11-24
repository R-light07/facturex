// Dados da aplicação
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let faturas = JSON.parse(localStorage.getItem('faturas')) || [];
let clienteEditando = null;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    // Configurar data atual no formulário
    const dataInput = document.getElementById('dataFatura');
    if (dataInput) {
        dataInput.value = new Date().toISOString().split('T')[0];
    }
    
    carregarClientes();
    inicializarEventListeners();
    calcularTotais();
    carregarListaClientes();
    carregarHistoricoFaturas();
    inicializarRelatorios();
}

function inicializarEventListeners() {
    // Event listeners para cálculos automáticos
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-quantidade') || 
            e.target.classList.contains('item-preco') ||
            e.target.id === 'iva') {
            calcularTotais();
        }
    });

    // Pesquisa de clientes
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarClientes);
    }
}

function inicializarRelatorios() {
    // Definir datas padrão (últimos 30 dias)
    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    
    document.getElementById('dataInicio').value = dataInicio.toISOString().split('T')[0];
    document.getElementById('dataFim').value = dataFim.toISOString().split('T')[0];
    
    // Carregar clientes no filtro
    carregarClientesRelatorio();
}

function carregarClientesRelatorio() {
    const select = document.getElementById('clienteRelatorio');
    if (!select) return;
    
    select.innerHTML = '<option value="">Todos os Clientes</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        select.appendChild(option);
    });
}

// Gestão de Seções
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover active de todos os items do menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Ativar item do menu correspondente
    const navLink = document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`);
    if (navLink) {
        navLink.parentElement.classList.add('active');
    }
    
    // Carregar dados específicos da seção
    if (sectionId === 'clientes') {
        carregarListaClientes();
    } else if (sectionId === 'historico') {
        carregarHistoricoFaturas();
    }
}

// Gestão de Clientes
function carregarClientes() {
    const select = document.getElementById('clienteSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} (${cliente.nif})`;
        select.appendChild(option);
    });
}

function carregarListaClientes() {
    const grid = document.getElementById('clients-grid');
    if (!grid) return;
    
    if (clientes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Nenhum cliente cadastrado</h3>
                <p>Adicione seu primeiro cliente para começar</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = clientes.map(cliente => `
        <div class="client-card" onclick="selecionarCliente('${cliente.id}')">
            <div class="client-header">
                <div>
                    <div class="client-name">${cliente.nome}</div>
                    <div class="client-nif">NUIT: ${cliente.nif}</div>
                </div>
                <div class="client-actions">
                    <button class="btn-icon" onclick="editarCliente('${cliente.id}', event)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="excluirCliente('${cliente.id}', event)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="client-info">
                ${cliente.email ? `<div><i class="fas fa-envelope"></i> ${cliente.email}</div>` : ''}
                ${cliente.telefone ? `<div><i class="fas fa-phone"></i> ${cliente.telefone}</div>` : ''}
                ${cliente.morada ? `<div><i class="fas fa-map-marker-alt"></i> ${cliente.morada}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function filtrarClientes() {
    const termo = document.getElementById('searchClient').value.toLowerCase();
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.nif.toLowerCase().includes(termo) ||
        (cliente.email && cliente.email.toLowerCase().includes(termo))
    );
    
    const grid = document.getElementById('clients-grid');
    if (!grid) return;
    
    if (clientesFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhum cliente encontrado</h3>
                <p>Tente alterar os termos da pesquisa</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = clientesFiltrados.map(cliente => `
        <div class="client-card" onclick="selecionarCliente('${cliente.id}')">
            <div class="client-header">
                <div>
                    <div class="client-name">${cliente.nome}</div>
                    <div class="client-nif">NUIT: ${cliente.nif}</div>
                </div>
                <div class="client-actions">
                    <button class="btn-icon" onclick="editarCliente('${cliente.id}', event)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="excluirCliente('${cliente.id}', event)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="client-info">
                ${cliente.email ? `<div><i class="fas fa-envelope"></i> ${cliente.email}</div>` : ''}
                ${cliente.telefone ? `<div><i class="fas fa-phone"></i> ${cliente.telefone}</div>` : ''}
                ${cliente.morada ? `<div><i class="fas fa-map-marker-alt"></i> ${cliente.morada}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function abrirModalCliente(clienteId = null) {
    clienteEditando = clienteId ? clientes.find(c => c.id === clienteId) : null;
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    
    if (!modal || !form) return;
    
    document.getElementById('modalTitle').textContent = clienteEditando ? 'Editar Cliente' : 'Novo Cliente';
    
    if (clienteEditando) {
        document.getElementById('clienteId').value = clienteEditando.id;
        document.getElementById('nome').value = clienteEditando.nome || '';
        document.getElementById('email').value = clienteEditando.email || '';
        document.getElementById('telefone').value = clienteEditando.telefone || '';
        document.getElementById('nif').value = clienteEditando.nif || '';
        document.getElementById('morada').value = clienteEditando.morada || '';
    } else {
        form.reset();
        document.getElementById('clienteId').value = '';
    }
    
    modal.classList.add('show');
}

function fecharModalCliente() {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.classList.remove('show');
    }
    clienteEditando = null;
}

function salvarCliente(event) {
    event.preventDefault();
    
    // Obter valores diretamente dos inputs
    const clienteId = document.getElementById('clienteId').value;
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const nif = document.getElementById('nif').value.trim();
    const morada = document.getElementById('morada').value.trim();
    
    // Validar campos obrigatórios
    if (!nome) {
        alert('Nome é um campo obrigatório.');
        document.getElementById('nome').focus();
        return;
    }
    
    if (!nif) {
        alert('NUIT é um campo obrigatório.');
        document.getElementById('nif').focus();
        return;
    }
    
    const clienteData = {
        id: clienteId || generateId(),
        nome: nome,
        email: email,
        telefone: telefone,
        nif: nif,
        morada: morada,
        dataCriacao: new Date().toISOString()
    };
    
    // Validar NIF único
    const clienteExistente = clientes.find(c => c.nif === clienteData.nif && c.id !== clienteData.id);
    if (clienteExistente) {
        alert('Já existe um cliente com este NUIT.');
        return;
    }
    
    try {
        if (clienteEditando) {
            // Atualizar cliente existente
            const index = clientes.findIndex(c => c.id === clienteData.id);
            if (index !== -1) {
                clientes[index] = { ...clientes[index], ...clienteData };
            }
        } else {
            // Adicionar novo cliente
            clientes.push(clienteData);
        }
        
        salvarDados();
        carregarClientes();
        carregarListaClientes();
        carregarClientesRelatorio();
        fecharModalCliente();
        
        alert(clienteEditando ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert('Erro ao salvar cliente. Verifique o console para mais detalhes.');
    }
}

function editarCliente(clienteId, event) {
    event.stopPropagation();
    abrirModalCliente(clienteId);
}

function excluirCliente(clienteId, event) {
    event.stopPropagation();
    
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clientes = clientes.filter(c => c.id !== clienteId);
        salvarDados();
        carregarClientes();
        carregarListaClientes();
        carregarClientesRelatorio();
        alert('Cliente excluído com sucesso!');
    }
}

function selecionarCliente(clienteId) {
    document.getElementById('clienteSelect').value = clienteId;
    carregarDadosCliente();
    showSection('fatura');
}

function carregarDadosCliente() {
    const clienteId = document.getElementById('clienteSelect').value;
    // Aqui você pode carregar dados adicionais do cliente se necessário
}

// Gestão de Itens da Fatura
function adicionarItem() {
    const container = document.getElementById('items-container');
    if (!container) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" class="item-descricao" placeholder="Descrição do item">
        <input type="number" class="item-quantidade" value="1" min="1">
        <input type="number" class="item-preco" value="0" step="0.01" min="0">
        <span class="item-total">0.00</span>
        <button class="btn-remove" onclick="removerItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(newItem);
    
    // Adicionar event listeners aos novos inputs
    const inputs = newItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calcularTotais);
    });
    
    calcularTotais();
}

function removerItem(button) {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length <= 1) {
        alert('A fatura deve ter pelo menos um item.');
        return;
    }
    
    const itemRow = button.closest('.item-row');
    if (itemRow) {
        itemRow.remove();
        calcularTotais();
    }
}

function calcularTotais() {
    let subtotal = 0;
    
    // Calcular total por item e subtotal
    document.querySelectorAll('.item-row').forEach(row => {
        const quantidadeInput = row.querySelector('.item-quantidade');
        const precoInput = row.querySelector('.item-preco');
        const totalSpan = row.querySelector('.item-total');
        
        if (!quantidadeInput || !precoInput || !totalSpan) return;
        
        const quantidade = parseFloat(quantidadeInput.value) || 0;
        const preco = parseFloat(precoInput.value) || 0;
        const totalItem = quantidade * preco;
        
        totalSpan.textContent = totalItem.toFixed(2);
        subtotal += totalItem;
    });
    
    // Calcular IVA e total
    const ivaInput = document.getElementById('iva');
    const ivaPercent = ivaInput ? parseFloat(ivaInput.value) || 0 : 23;
    const valorIVA = subtotal * (ivaPercent / 100);
    const total = subtotal + valorIVA;
    
    // Atualizar displays
    const subtotalEl = document.getElementById('subtotal');
    const valorIvaEl = document.getElementById('valor-iva');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (valorIvaEl) valorIvaEl.textContent = valorIVA.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2) + ' MZN';
}

// Gestão de Faturas
function gerarFatura() {
    if (!validarFormularioFatura()) {
        return;
    }

    const clienteSelect = document.getElementById('clienteSelect');
    const clienteId = clienteSelect ? clienteSelect.value : null;
    const cliente = clientes.find(c => c.id === clienteId);

    if (!cliente) {
        alert('Por favor, selecione um cliente.');
        return;
    }

    const faturaContent = document.getElementById('faturaContent');
    if (!faturaContent) return;

    // Obter dados da fatura
    const numeroFatura = 'FAT' + new Date().getTime().toString().slice(-6);
    const dataEmissao = new Date().toLocaleDateString('pt-PT');
    const dataInput = document.getElementById('dataFatura');
    const dataFatura = dataInput ? dataInput.value : dataEmissao;
    
    // Obter itens da fatura
    const itens = obterItensFatura();
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const valorIVA = parseFloat(document.getElementById('valor-iva').textContent);
    const total = parseFloat(document.getElementById('total').textContent);
    const ivaPercent = document.getElementById('iva').value;

    // Gerar conteúdo da fatura com quebras de página
    const htmlFatura = gerarEstruturaFatura(
        numeroFatura, 
        dataFatura, 
        cliente, 
        itens, 
        subtotal, 
        valorIVA, 
        total, 
        ivaPercent
    );

    faturaContent.innerHTML = htmlFatura;

    // Salvar fatura no histórico
    salvarFaturaNoHistorico(numeroFatura, dataFatura, clienteId, itens, subtotal, valorIVA, total);

    // Mostrar preview
    document.getElementById('faturaPreview').classList.add('show');
}

function obterItensFatura() {
    const itens = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const descricao = row.querySelector('.item-descricao').value;
        const quantidade = parseFloat(row.querySelector('.item-quantidade').value) || 0;
        const preco = parseFloat(row.querySelector('.item-preco').value) || 0;
        
        if (descricao && quantidade > 0 && preco >= 0) {
            itens.push({
                descricao,
                quantidade,
                preco,
                total: quantidade * preco
            });
        }
    });
    return itens;
}

function gerarEstruturaFatura(numero, data, cliente, itens, subtotal, iva, total, ivaPercent) {
    // Calcular quantas páginas serão necessárias (máximo 20 itens por página)
    const itensPorPagina = 20;
    const totalPaginas = Math.ceil(itens.length / itensPorPagina);
    
    let html = '';
    
    for (let pagina = 0; pagina < totalPaginas; pagina++) {
        const inicio = pagina * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const itensPagina = itens.slice(inicio, fim);
        
        html += `
            <div class="pagina-fatura">
                <div class="cabecalho-pagina">
                    ${pagina === 0 ? gerarCabecalhoFatura(numero, data, cliente) : gerarCabecalhoContinuacao(numero, data, cliente, pagina + 1)}
                </div>
                
                ${gerarTabelaItens(itensPagina, pagina === 0)}
                
                ${pagina === totalPaginas - 1 ? gerarTotaisFatura(subtotal, iva, total, ivaPercent) : ''}
                
                <div class="rodape-pagina">
                    Página ${pagina + 1} de ${totalPaginas}
                </div>
            </div>
        `;
    }
    
    return html;
}

function gerarCabecalhoFatura(numero, data, cliente) {
    return `
        <div class="dadosEmpresas">
            <div class="empresa-info">
                <h2 style="color: #2563eb; margin-bottom: 0.5rem; font-size: 1.5rem;">Liteshutter</h2>
                <p>NUIT: 123456789</p>
                <p>Av. Maria de Lurdes Mutola, Nr. 1023, Maputo</p>
                <p>Tel: +258 842525842 | Email: liteshutter@gmail.com</p>
            </div>
            <div class="cliente-info">
                <h3 style="color: #2563eb; margin-bottom: 1rem;">Dados do Cliente</h3>
                <p><strong>${cliente.nome}</strong></p>
                <p>NUIT: ${cliente.nif}</p>
                ${cliente.morada ? `<p>${cliente.morada}</p>` : ''}
                ${cliente.email ? `<p>${cliente.email}</p>` : ''}
                ${cliente.telefone ? `<p>${cliente.telefone}</p>` : ''}
            </div>
        </div>
        
        <div class="fatura-header">          
            <div class="fatura-info">
                <h3 style="color: #2563eb; margin-bottom: 1rem;">Dados da Fatura</h3>
                <div class="fatura-info-box">
                    <div class="fatura-info-line">
                        <strong>Número: </strong>
                        <span>${numero}</span>
                    </div>
                    <div class="fatura-info-line">
                        <strong>Data de Emissão: </strong>
                        <span>${new Date(data).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <div class="fatura-info-line">
                        <strong>Data de Vencimento: </strong>
                        <span>${calcularDataVencimento(data)}</span>
                    </div>
                    <div class="fatura-info-line">
                        <strong>Método de Pagamento:</strong>
                        <span>Transferência Bancária</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function gerarCabecalhoContinuacao(numero, data, cliente, pagina) {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="color: #2563eb; margin-bottom: 0.5rem; font-size: 1.5rem;">Minha Empresa Lda</h2>
                <p><strong>Fatura:</strong> ${numero}</p>
            </div>
            <div>
                <h3 style="color: #2563eb; margin-bottom: 0.5rem;">Continuação - Página ${pagina}</h3>
                <p><strong>Cliente:</strong> ${cliente.nome}</p>
                <p><strong>Data:</strong> ${new Date(data).toLocaleDateString('pt-PT')}</p>
            </div>
        </div>
    `;
}

function gerarTabelaItens(itens, primeiraPagina) {
    const cabecalho = primeiraPagina ? `
        <thead>
            <tr>
                <th>Descrição</th>
                <th style="text-align: center;">Quantidade</th>
                <th style="text-align: right;">Preço Unitário</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
    ` : '';

    return `
        <div class="fatura-itens">
            <table>
                ${cabecalho}
                <tbody>
                    ${itens.map(item => `
                        <tr>
                            <td>${item.descricao}</td>
                            <td style="text-align: center;">${item.quantidade}</td>
                            <td style="text-align: right;">${item.preco.toFixed(2)}</td>
                            <td style="text-align: right;">${item.total.toFixed(2)} MZN</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function gerarTotaisFatura(subtotal, iva, total, ivaPercent) {
    return `
        <div class="fatura-totais">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>IVA (${ivaPercent}%):</td>
                    <td style="text-align: right;">${iva.toFixed(2)}</td>
                </tr>
                <tr class="total-final">
                    <td><strong>Total:</strong></td>
                    <td style="text-align: right;"><strong>${total.toFixed(2)} MZN</strong></td>
                </tr>
            </table>
            
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
                <p><strong>Obrigado pela sua preferência!</strong></p>
                <p>Para qualquer questão, contacte-nos através do email: empresa@email.com</p>
            </div>
        </div>
    `;
}

function calcularDataVencimento(dataEmissao) {
    const data = new Date(dataEmissao);
    data.setDate(data.getDate() + 30); // 30 dias para vencimento
    return data.toLocaleDateString('pt-PT');
}

function salvarFaturaNoHistorico(numero, data, clienteId, itens, subtotal, iva, total) {
    const fatura = {
        id: 'fatura_' + Date.now(),
        numero: numero,
        data: data,
        clienteId: clienteId,
        itens: itens,
        subtotal: subtotal,
        iva: iva,
        total: total,
        dataCriacao: new Date().toISOString()
    };
    
    faturas.push(fatura);
    salvarDados();
    carregarHistoricoFaturas();
}

function carregarHistoricoFaturas() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (faturas.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>Nenhuma fatura gerada</h3>
                <p>As faturas que você criar aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = faturas.map(fatura => {
        const cliente = clientes.find(c => c.id === fatura.clienteId) || {};
        return `
            <div class="client-card" onclick="abrirDetalhesFatura('${fatura.id}')">
                <div class="client-header">
                    <div>
                        <div class="client-name">${fatura.numero} - ${cliente.nome || 'Cliente não encontrado'}</div>
                        <div class="client-nif">Data: ${new Date(fatura.data).toLocaleDateString('pt-PT')}</div>
                    </div>
                    <div class="client-actions">
                        <span style="font-weight: bold; color: var(--primary);">${fatura.total.toFixed(2)} MZN</span>
                    </div>
                </div>
                <div class="client-info">
                    <div><i class="fas fa-receipt"></i> ${fatura.itens.length} itens</div>
                    <div><i class="fas fa-calendar"></i> ${new Date(fatura.dataCriacao).toLocaleDateString('pt-PT')}</div>
                </div>
            </div>
        `;
    }).join('');
}

function abrirDetalhesFatura(faturaId) {
    const fatura = faturas.find(f => f.id === faturaId);
    if (!fatura) return;
    
    const cliente = clientes.find(c => c.id === fatura.clienteId) || {};
    
    const htmlFatura = gerarEstruturaFatura(
        fatura.numero, 
        fatura.data, 
        cliente, 
        fatura.itens, 
        fatura.subtotal, 
        fatura.iva, 
        fatura.total, 
        '23'
    );

    const faturaContent = document.getElementById('faturaContent');
    if (faturaContent) {
        faturaContent.innerHTML = htmlFatura;
        document.getElementById('faturaPreview').classList.add('show');
    }
}

function validarFormularioFatura() {
    const clienteSelect = document.getElementById('clienteSelect');
    if (!clienteSelect || !clienteSelect.value) {
        alert('Por favor, selecione um cliente.');
        return false;
    }
    
    // Verificar se todos os itens têm descrição e valor
    let todosItensValidos = true;
    document.querySelectorAll('.item-row').forEach(row => {
        const descricao = row.querySelector('.item-descricao').value;
        const preco = parseFloat(row.querySelector('.item-preco').value);
        
        if (!descricao.trim() || preco <= 0) {
            todosItensValidos = false;
        }
    });
    
    if (!todosItensValidos) {
        alert('Por favor, preencha a descrição e um preço válido para todos os itens.');
        return false;
    }
    
    return true;
}

function limparFormulario() {
    if (confirm('Tem a certeza que deseja limpar todo o formulário?')) {
        // Limpar seleção de cliente
        const clienteSelect = document.getElementById('clienteSelect');
        if (clienteSelect) clienteSelect.value = '';
        
        // Limpar data (colocar data atual)
        const dataInput = document.getElementById('dataFatura');
        if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];
        
        // Manter apenas o primeiro item e limpar seus valores
        const itemsContainer = document.getElementById('items-container');
        if (itemsContainer) {
            const primeiroItem = itemsContainer.querySelector('.item-row');
            itemsContainer.innerHTML = '';
            itemsContainer.appendChild(primeiroItem);
            
            primeiroItem.querySelector('.item-descricao').value = '';
            primeiroItem.querySelector('.item-quantidade').value = '1';
            primeiroItem.querySelector('.item-preco').value = '0';
        }
        
        // Resetar IVA
        const ivaInput = document.getElementById('iva');
        if (ivaInput) ivaInput.value = '23';
        
        calcularTotais();
    }
}

function fecharPreview() {
    const preview = document.getElementById('faturaPreview');
    if (preview) {
        preview.classList.remove('show');
    }
}

function imprimirFatura() {
    window.print();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obter conteúdo da fatura
    const faturaContent = document.getElementById('faturaContent');
    if (!faturaContent) return;
    
    // Aqui você implementaria a lógica para converter o HTML em PDF
    // Esta é uma implementação básica - em produção use uma biblioteca mais robusta
    doc.text('Funcionalidade PDF em desenvolvimento', 20, 20);
    doc.save('fatura.pdf');
}

// Sistema de Relatórios
function gerarRelatorio() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const clienteId = document.getElementById('clienteRelatorio').value;
    
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione o período do relatório.');
        return;
    }
    
    const faturasFiltradas = filtrarFaturas(dataInicio, dataFim, clienteId);
    exibirRelatorio(faturasFiltradas);
    atualizarEstatisticas(faturasFiltradas);
}

function filtrarFaturas(dataInicio, dataFim, clienteId) {
    return faturas.filter(fatura => {
        const dataFatura = new Date(fatura.data);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        
        const dataValida = dataFatura >= inicio && dataFatura <= fim;
        const clienteValido = !clienteId || fatura.clienteId === clienteId;
        
        return dataValida && clienteValido;
    });
}

function exibirRelatorio(faturasFiltradas) {
    const corpoTabela = document.getElementById('corpoTabelaRelatorios');
    if (!corpoTabela) return;
    
    if (faturasFiltradas.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    Nenhuma fatura encontrada para o período selecionado
                </td>
            </tr>
        `;
        return;
    }
    
    corpoTabela.innerHTML = faturasFiltradas.map(fatura => {
        const cliente = clientes.find(c => c.id === fatura.clienteId) || {};
        
        return `
            <tr onclick="abrirDetalhesFatura('${fatura.id}')" style="cursor: pointer;">
                <td>${fatura.numero}</td>
                <td>${new Date(fatura.data).toLocaleDateString('pt-PT')}</td>
                <td>${cliente.nome || 'Cliente não encontrado'}</td>
                <td>${fatura.subtotal.toFixed(2)}</td>
                <td>${fatura.iva.toFixed(2)}</td>
                <td><strong>${fatura.total.toFixed(2)} MZN</strong></td>
            </tr>
        `;
    }).join('');
}

function atualizarEstatisticas(faturasFiltradas) {
    const totalFaturas = faturasFiltradas.length;
    const totalVendas = faturasFiltradas.reduce((sum, fatura) => sum + fatura.total, 0);
    const totalIVA = faturasFiltradas.reduce((sum, fatura) => sum + fatura.iva, 0);
    const mediaFatura = totalFaturas > 0 ? totalVendas / totalFaturas : 0;
    
    document.getElementById('totalFaturas').textContent = totalFaturas;
    document.getElementById('totalVendas').textContent = totalVendas.toFixed(2);
    document.getElementById('mediaFatura').textContent = mediaFatura.toFixed(2);
    document.getElementById('totalIVA').textContent = totalIVA.toFixed(2) + ' MZN';
}

function exportarPDF() {
    const faturasFiltradas = obterFaturasFiltradasAtuais();
    
    if (faturasFiltradas.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Relatório de Faturas', 20, 30);
    
    // Período
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-PT')} a ${new Date(dataFim).toLocaleDateString('pt-PT')}`, 20, 45);
    
    // Tabela
    let yPos = 60;
    
    // Cabeçalho da tabela
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.text('Número', 22, yPos + 7);
    doc.text('Data', 50, yPos + 7);
    doc.text('Cliente', 80, yPos + 7);
    doc.text('Total', 150, yPos + 7);
    
    yPos += 15;
    
    // Linhas da tabela
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    faturasFiltradas.forEach((fatura, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        const cliente = clientes.find(c => c.id === fatura.clienteId) || {};
        
        doc.text(fatura.numero, 22, yPos);
        doc.text(new Date(fatura.data).toLocaleDateString('pt-PT'), 50, yPos);
        doc.text(cliente.nome || '-', 80, yPos);
        doc.text(fatura.total.toFixed(2) + ' MZN', 150, yPos);
        
        yPos += 8;
        
        // Linha separadora
        if (index < faturasFiltradas.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPos - 2, 190, yPos - 2);
            yPos += 5;
        }
    });
    
    // Totais
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    const totalVendas = faturasFiltradas.reduce((sum, fatura) => sum + fatura.total, 0);
    const totalFaturas = faturasFiltradas.length;
    
    doc.text(`Total de Faturas: ${totalFaturas}`, 20, yPos);
    doc.text(`Valor Total: ${totalVendas.toFixed(2)} MZN`, 120, yPos);
    
    // Rodapé
    yPos += 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, 20, yPos);
    
    // Salvar PDF
    doc.save(`relatorio-faturas-${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportarExcel() {
    const faturasFiltradas = obterFaturasFiltradasAtuais();
    
    if (faturasFiltradas.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    let csvContent = "Número;Data;Cliente;NUIT;Subtotal;IVA;Total\n";
    
    faturasFiltradas.forEach(fatura => {
        const cliente = clientes.find(c => c.id === fatura.clienteId) || {};
        
        const linha = [
            fatura.numero,
            new Date(fatura.data).toLocaleDateString('pt-PT'),
            `"${cliente.nome || ''}"`,
            cliente.nif || '',
            fatura.subtotal.toFixed(2).replace('.', ','),
            fatura.iva.toFixed(2).replace('.', ','),
            fatura.total.toFixed(2).replace('.', ',')
        ].join(';');
        
        csvContent += linha + '\n';
    });
    
    // Adicionar totais
    const totalVendas = faturasFiltradas.reduce((sum, fatura) => sum + fatura.total, 0);
    const totalFaturas = faturasFiltradas.length;
    
    csvContent += `\n;;;Total Faturas:;${totalFaturas};;\n`;
    csvContent += `;;;Valor Total:;;;${totalVendas.toFixed(2).replace('.', ',')} MZN`;
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-faturas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportarCSV() {
    exportarExcel(); // Reutiliza a função de Excel para CSV
}

function obterFaturasFiltradasAtuais() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const clienteId = document.getElementById('clienteRelatorio').value;
    
    return filtrarFaturas(dataInicio, dataFim, clienteId);
}

// Utilitários
function generateId() {
    return 'cliente_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

function salvarDados() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('faturas', JSON.stringify(faturas));
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('clientModal');
    if (modal && e.target === modal) {
        fecharModalCliente();
    }
    
    const preview = document.getElementById('faturaPreview');
    if (preview && e.target === preview) {
        fecharPreview();
    }
});

// Prevenir fechamento do modal ao clicar dentro do conteúdo
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});