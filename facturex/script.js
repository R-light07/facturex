// Adicionar novo item à fatura
function adicionarItem() {
    const itemsContainer = document.getElementById('items-container');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" class="item-descricao" placeholder="Descrição do item">
        <input type="number" class="item-quantidade" value="1" min="1">
        <input type="number" class="item-preco" value="0" step="0.01" min="0">
        <span class="item-total">0.00 €</span>
        <button class="btn-remover" onclick="removerItem(this)">×</button>
    `;
    itemsContainer.appendChild(newItem);
    
    // Adicionar event listeners aos novos inputs
    const inputs = newItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calcularTotais);
    });
}

// Remover item da fatura
function removerItem(button) {
    const itemRow = button.parentElement;
    if (document.querySelectorAll('.item-row').length > 1) {
        itemRow.remove();
        calcularTotais();
    } else {
        alert('A fatura deve ter pelo menos um item.');
    }
}

// Calcular totais
function calcularTotais() {
    let subtotal = 0;
    
    // Calcular total por item e subtotal
    document.querySelectorAll('.item-row').forEach(row => {
        const quantidade = parseFloat(row.querySelector('.item-quantidade').value) || 0;
        const preco = parseFloat(row.querySelector('.item-preco').value) || 0;
        const totalItem = quantidade * preco;
        
        row.querySelector('.item-total').textContent = totalItem.toFixed(2) + ' €';
        subtotal += totalItem;
    });
    
    // Calcular IVA e total
    const ivaPercent = parseFloat(document.getElementById('iva').value) || 0;
    const valorIVA = subtotal * (ivaPercent / 100);
    const total = subtotal + valorIVA;
    
    // Atualizar displays
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('valor-iva').textContent = valorIVA.toFixed(2) + ' €';
    document.getElementById('total').textContent = total.toFixed(2) + ' €';
}

// Gerar fatura
function gerarFatura() {
    // Validar dados
    if (!validarFormulario()) {
        return;
    }
    
    const faturaContent = document.querySelector('.fatura-content');
    const numeroFatura = 'FAT' + new Date().getTime().toString().slice(-6);
    const dataEmissao = new Date().toLocaleDateString('pt-PT');
    
    faturaContent.innerHTML = `
        <div class="fatura-header">
            <div class="fatura-empresa">
                <h3>${document.getElementById('empresaNome').value}</h3>
                <p>NIF: ${document.getElementById('empresaNIF').value}</p>
                <p>${document.getElementById('empresaMorada').value}</p>
            </div>
            <div class="fatura-info">
                <h2>FATURA</h2>
                <p><strong>Número:</strong> ${numeroFatura}</p>
                <p><strong>Data:</strong> ${dataEmissao}</p>
            </div>
        </div>
        
        <div class="fatura-detalhes">
            <div class="fatura-cliente">
                <h4>Cliente:</h4>
                <p><strong>${document.getElementById('clienteNome').value}</strong></p>
                <p>NIF: ${document.getElementById('clienteNIF').value}</p>
                <p>${document.getElementById('clienteMorada').value}</p>
            </div>
        </div>
        
        <div class="fatura-itens">
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasItens()}
                </tbody>
            </table>
        </div>
        
        <div class="fatura-totais">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>${document.getElementById('subtotal').textContent}</td>
                </tr>
                <tr>
                    <td>IVA (${document.getElementById('iva').value}%):</td>
                    <td>${document.getElementById('valor-iva').textContent}</td>
                </tr>
                <tr class="total-final">
                    <td><strong>Total:</strong></td>
                    <td><strong>${document.getElementById('total').textContent}</strong></td>
                </tr>
            </table>
        </div>
    `;
    
    // Mostrar pré-visualização
    document.querySelector('.invoice-form').classList.add('hidden');
    document.getElementById('fatura-preview').classList.remove('hidden');
}

// Gerar linhas da tabela de itens
function gerarLinhasItens() {
    let linhas = '';
    document.querySelectorAll('.item-row').forEach(row => {
        const descricao = row.querySelector('.item-descricao').value || 'Item sem descrição';
        const quantidade = row.querySelector('.item-quantidade').value;
        const preco = parseFloat(row.querySelector('.item-preco').value).toFixed(2);
        const total = row.querySelector('.item-total').textContent;
        
        linhas += `
            <tr>
                <td>${descricao}</td>
                <td>${quantidade}</td>
                <td>${preco} €</td>
                <td>${total}</td>
            </tr>
        `;
    });
    return linhas;
}

// Validar formulário
function validarFormulario() {
    const clienteNome = document.getElementById('clienteNome').value;
    const clienteNIF = document.getElementById('clienteNIF').value;
    
    if (!clienteNome.trim()) {
        alert('Por favor, insira o nome do cliente.');
        return false;
    }
    
    if (!clienteNIF.trim()) {
        alert('Por favor, insira o NIF do cliente.');
        return false;
    }
    
    // Verificar se todos os itens têm descrição
    let todosItensValidos = true;
    document.querySelectorAll('.item-descricao').forEach(input => {
        if (!input.value.trim()) {
            todosItensValidos = false;
        }
    });
    
    if (!todosItensValidos) {
        alert('Por favor, insira a descrição para todos os itens.');
        return false;
    }
    
    return true;
}

// Limpar formulário
function limparFormulario() {
    if (confirm('Tem a certeza que deseja limpar todo o formulário?')) {
        document.getElementById('clienteNome').value = '';
        document.getElementById('clienteNIF').value = '';
        document.getElementById('clienteMorada').value = '';
        
        // Manter apenas o primeiro item e limpar seus valores
        const itemsContainer = document.getElementById('items-container');
        const primeiroItem = itemsContainer.querySelector('.item-row');
        itemsContainer.innerHTML = '';
        itemsContainer.appendChild(primeiroItem);
        
        primeiroItem.querySelector('.item-descricao').value = '';
        primeiroItem.querySelector('.item-quantidade').value = '1';
        primeiroItem.querySelector('.item-preco').value = '0';
        
        document.getElementById('iva').value = '23';
        
        calcularTotais();
    }
}

// Imprimir fatura
function imprimirFatura() {
    window.print();
}

// Voltar ao formulário
function voltarAoFormulario() {
    document.getElementById('fatura-preview').classList.add('hidden');
    document.querySelector('.invoice-form').classList.remove('hidden');
}

// Inicializar event listeners quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar event listeners para calcular totais automaticamente
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calcularTotais);
    });
    
    // Calcular totais iniciais
    calcularTotais();
});