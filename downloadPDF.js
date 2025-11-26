function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    try {
        // ===== OBTER DADOS DA FATURA =====
        const clienteSelect = document.getElementById('clienteSelect');
        const clienteId = clienteSelect ? clienteSelect.value : null;
        const cliente = clientes.find(c => c.id === clienteId);

        if (!cliente) {
            alert('Por favor, selecione um cliente para gerar o PDF.');
            return;
        }

        const itens = obterItensFatura();
        const subtotal = parseFloat(document.getElementById('subtotal').textContent);
        const valorIVA = parseFloat(document.getElementById('valor-iva').textContent);
        const total = parseFloat(document.getElementById('total').textContent);
        const ivaPercent = document.getElementById('iva').value;

        const numeroFatura = 'FAT' + new Date().getTime().toString().slice(-6);
        const dataInput = document.getElementById('dataFatura');
        const dataFatura = dataInput ? dataInput.value : new Date().toISOString().split('T')[0];

        // ===== CABEÇALHO COM EMPRESA À ESQUERDA E CLIENTE À DIREITA =====
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        
        // Título da empresa (esquerda)
        doc.text('Liteshutter', margin, yPos);
        
        // Título do cliente (direita)
        doc.text('Dados do Cliente', pageWidth - margin - 50, yPos);
        
        yPos += 8;

        // ===== DADOS DA EMPRESA (ESQUERDA) =====
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        doc.text('NUIT: 123456789', margin, yPos);
        yPos += 4;
        doc.text('Av. Maria de Lurdes Mutola,', margin, yPos);
        yPos += 4;
        doc.text('Nr. 1023, Maputo', margin, yPos);
        yPos += 4;
        doc.text('Tel: +258 842525842', margin, yPos);
        yPos += 4;
        doc.text('Email: liteshutter@gmail.com', margin, yPos);


        // ===== DADOS DO CLIENTE (DIREITA) - mesma altura =====
        let clienteY = yPos - 16; // Voltar para a mesma altura dos dados da empresa
        
        doc.setFont(undefined, 'bold');
        doc.text(cliente.nome, pageWidth - margin - 50, clienteY);
        clienteY += 4;
        
        doc.setFont(undefined, 'normal');
        doc.text(`NUIT: ${cliente.nif}`, pageWidth - margin - 50, clienteY);
        clienteY += 4;
        
        if (cliente.morada) {
            doc.text(cliente.morada, pageWidth - margin - 50, clienteY);
            clienteY += 4;
        }
        
        if (cliente.email) {
            doc.text(cliente.email, pageWidth - margin - 50, clienteY);
            clienteY += 4;
        }
        
        if (cliente.telefone) {
            doc.text(cliente.telefone, pageWidth - margin - 50, clienteY);
        }

        yPos += 15;

        // ===== LINHA SEPARADORA =====
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // ===== CABEÇALHO ORIGINAL =====
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Original', margin, yPos);
        yPos += 8;

        // ===== TABELA DE INFORMAÇÕES DA FATURA =====
        const infoHeaders = ['Número:', 'Data:', 'Vencimento:', 'Método de Pag.:'];
        const infoValues = [
            numeroFatura,
            new Date(dataFatura).toLocaleDateString('pt-PT'),
            calcularDataVencimento(dataFatura),
            'Transferência Bancária'
        ];

        // Calcular larguras das colunas
        const colWidths = [40, 40, 40, 45];
        let xPos = margin;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        
        // Cabeçalhos
        infoHeaders.forEach((header, index) => {
            doc.text(header, xPos, yPos);
            xPos += colWidths[index];
        });

        yPos += 4;
        xPos = margin;
        doc.setFont(undefined, 'normal');
        
        // Valores
        infoValues.forEach((value, index) => {
            doc.text(value, xPos, yPos);
            xPos += colWidths[index];
        });

        yPos += 10;

        // ===== CABEÇALHO DA TABELA DE ITENS =====
        const itemHeaders = ['Descrição', 'Quantidade', 'Preço Unitário', 'Total'];
        const itemColWidths = [70, 25, 35, 30];
        
        xPos = margin;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        
        itemHeaders.forEach((header, index) => {
            if (index === 1 || index === 2 || index === 3) {
                doc.text(header, xPos + itemColWidths[index] - 2, yPos, { align: 'right' });
            } else {
                doc.text(header, xPos, yPos);
            }
            xPos += itemColWidths[index];
        });

        // Linha sob o cabeçalho
        yPos += 3;
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // ===== ITENS DA FATURA =====
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        itens.forEach((item, index) => {
            xPos = margin;
            
            // Descrição
            const descricaoLines = doc.splitTextToSize(item.descricao, 65);
            const descricaoHeight = Math.max(descricaoLines.length * 4, 6);
            
            doc.text(descricaoLines, xPos, yPos);
            xPos += itemColWidths[0];
            
            // Quantidade
            doc.text(item.quantidade.toString(), xPos + itemColWidths[1] - 2, yPos, { align: 'right' });
            xPos += itemColWidths[1];
            
            // Preço Unitário
            doc.text(item.preco.toFixed(2), xPos + itemColWidths[2] - 2, yPos, { align: 'right' });
            xPos += itemColWidths[2];
            
            // Total
            doc.text(item.total.toFixed(2) + ' MZN', xPos + itemColWidths[3] - 2, yPos, { align: 'right' });
            
            yPos += descricaoHeight + 3;
            
            // Linha separadora entre itens
            if (index < itens.length - 1) {
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
                yPos += 2;
            }
        });

        // ===== TOTAIS =====
        yPos += 8;
        
        // Linha acima dos totais
        doc.setDrawColor(0, 0, 0);
        doc.line(pageWidth - margin - 80, yPos - 8, pageWidth - margin, yPos - 8);
        
        // Subtotal
        doc.setFont(undefined, 'normal');
        doc.text('Subtotal:', pageWidth - margin - 70, yPos);
        doc.text(subtotal.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
        yPos += 5;
        
        // IVA
        doc.text(`IVA (${ivaPercent}%):`, pageWidth - margin - 70, yPos);
        doc.text(valorIVA.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
        yPos += 8;
        
        // Total
        doc.setFont(undefined, 'bold');
        doc.text('Total:', pageWidth - margin - 70, yPos);
        doc.text(total.toFixed(2) + ' MZN', pageWidth - margin - 2, yPos, { align: 'right' });

        // ===== LINHA SEPARADORA FINAL =====
        yPos += 15;
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 12;

        //===== DADOS BANCÁRIOS =====

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');

        doc.text('Dados Bancários:', margin, yPos);
        yPos += 4;
        doc.text('BCI', margin, yPos);
        yPos += 4;
        doc.text('CONTA: 2042 3321 01 0001', margin, yPos);
        yPos += 4;
        doc.text('NIB: 0008 0000 0423 3210 10113', margin, yPos);
        yPos += 8;

        doc.text('BIM', margin, yPos);
        yPos += 4;
        doc.text('CONTA: 595232741', margin, yPos);
        yPos += 4;
        doc.text('NIB: 0001 0000 0059 5232 74157', margin, yPos);
        yPos += 8;

        // ===== MENSAGEM FINAL =====
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Obrigado pela sua preferência!', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 5;
        doc.text('Para qualquer questão, contacte-nos através do email: liteshutter@gmail.com', 
                pageWidth / 2, yPos, { align: 'center' });

        // ===== PAGINAÇÃO =====
        yPos += 15;
        doc.setFontSize(8);
        doc.text('Página 1 de 1', pageWidth / 2, yPos, { align: 'center' });

        // ===== SALVAR PDF =====
        const nomeArquivo = `fatura_${numeroFatura}_${cliente.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(nomeArquivo);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
    }
}

// Função auxiliar para calcular data de vencimento
function calcularDataVencimento(dataEmissao) {
    const data = new Date(dataEmissao);
    data.setDate(data.getDate() + 30);
    return data.toLocaleDateString('pt-PT');
}