function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obter conteúdo da fatura
    const faturaContent = document.getElementById('faturaContent');
    if (!faturaContent) {
        alert('Erro: Conteúdo da fatura não encontrado.');
        return;
    }
    
    // Configurações do PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = {
        top: 20,
        bottom: 30,
        left: 15,
        right: 15
    };
    
    let yPos = margins.top;
    const lineHeight = 7;
    const sectionSpacing = 10;
    
    try {
        // ===== CABEÇALHO DA EMPRESA =====
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(37, 99, 235); // Azul primário
        doc.text('LITESHUTTER', margins.left, yPos);
        
        yPos += lineHeight;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('NUIT: 123456789', margins.left, yPos);
        
        yPos += lineHeight;
        doc.text('Av. Maria de Lurdes Mutola, Nr. 1023, Maputo', margins.left, yPos);
        
        yPos += lineHeight;
        doc.text('Tel: +258 842525842 | Email: liteshutter@gmail.com', margins.left, yPos);
        
        yPos += sectionSpacing;
        
        // ===== DADOS DO CLIENTE =====
        const clienteSelect = document.getElementById('clienteSelect');
        const clienteId = clienteSelect ? clienteSelect.value : null;
        const cliente = clientes.find(c => c.id === clienteId);
        
        if (cliente) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text('DADOS DO CLIENTE:', margins.left, yPos);
            
            yPos += lineHeight;
            doc.setFont(undefined, 'normal');
            doc.text(`Nome: ${cliente.nome}`, margins.left, yPos);
            
            yPos += lineHeight;
            doc.text(`NUIT: ${cliente.nif}`, margins.left, yPos);
            
            if (cliente.morada) {
                yPos += lineHeight;
                doc.text(`Morada: ${cliente.morada}`, margins.left, yPos);
            }
            
            if (cliente.email) {
                yPos += lineHeight;
                doc.text(`Email: ${cliente.email}`, margins.left, yPos);
            }
            
            if (cliente.telefone) {
                yPos += lineHeight;
                doc.text(`Telefone: ${cliente.telefone}`, margins.left, yPos);
            }
        }
        
        yPos += sectionSpacing;
        
        // ===== INFORMAÇÕES DA FATURA =====
        const numeroFatura = 'FAT' + new Date().getTime().toString().slice(-6);
        const dataInput = document.getElementById('dataFatura');
        const dataFatura = dataInput ? dataInput.value : new Date().toISOString().split('T')[0];
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('ORIGINAL', pageWidth - margins.right - 30, margins.top);
        
        doc.setFont(undefined, 'normal');
        let infoY = margins.top + lineHeight;
        doc.text(`Número: ${numeroFatura}`, pageWidth - margins.right - 30, infoY);
        
        infoY += lineHeight;
        doc.text(`Data: ${new Date(dataFatura).toLocaleDateString('pt-PT')}`, pageWidth - margins.right - 30, infoY);
        
        infoY += lineHeight;
        doc.text(`Vencimento: ${calcularDataVencimento(dataFatura)}`, pageWidth - margins.right - 30, infoY);
        
        infoY += lineHeight;
        doc.text(`Método de Pag.: Transferência`, pageWidth - margins.right - 30, infoY);
        
        yPos = Math.max(yPos, infoY + sectionSpacing);
        
        // ===== TABELA DE ITENS =====
        const itens = obterItensFatura();
        if (itens.length > 0) {
            // Cabeçalho da tabela
            doc.setFont(undefined, 'bold');
            doc.setFillColor(37, 99, 235);
            doc.setTextColor(255, 255, 255);
            doc.rect(margins.left, yPos, pageWidth - margins.left - margins.right, 8, 'F');
            
            doc.text('Descrição', margins.left + 2, yPos + 5);
            doc.text('Qtd', pageWidth - margins.right - 60, yPos + 5);
            doc.text('Preço', pageWidth - margins.right - 40, yPos + 5);
            doc.text('Total', pageWidth - margins.right - 15, yPos + 5);
            
            yPos += 10;
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Itens
            itens.forEach((item, index) => {
                // Verificar se precisa de nova página
                if (yPos > pageHeight - margins.bottom - 20) {
                    doc.addPage();
                    yPos = margins.top;
                }
                
                doc.text(item.descricao, margins.left + 2, yPos + 5);
                doc.text(item.quantidade.toString(), pageWidth - margins.right - 60, yPos + 5, { align: 'right' });
                doc.text(item.preco.toFixed(2), pageWidth - margins.right - 40, yPos + 5, { align: 'right' });
                doc.text(item.total.toFixed(2) + ' MZN', pageWidth - margins.right - 15, yPos + 5, { align: 'right' });
                
                yPos += 6;
                
                // Linha separadora
                if (index < itens.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margins.left, yPos + 2, pageWidth - margins.right, yPos + 2);
                    yPos += 4;
                }
            });
            
            yPos += sectionSpacing;
            
            // ===== TOTAIS =====
            const subtotal = parseFloat(document.getElementById('subtotal').textContent);
            const valorIVA = parseFloat(document.getElementById('valor-iva').textContent);
            const total = parseFloat(document.getElementById('total').textContent);
            const ivaPercent = document.getElementById('iva').value;
            
            // Linha de subtotal
            doc.text('Subtotal:', pageWidth - margins.right - 50, yPos);
            doc.text(subtotal.toFixed(2) + ' MZN', pageWidth - margins.right - 15, yPos, { align: 'right' });
            
            yPos += lineHeight;
            
            // Linha de IVA
            doc.text(`IVA (${ivaPercent}%):`, pageWidth - margins.right - 50, yPos);
            doc.text(valorIVA.toFixed(2) + ' MZN', pageWidth - margins.right - 15, yPos, { align: 'right' });
            
            yPos += lineHeight;
            
            // Linha do total
            doc.setFont(undefined, 'bold');
            doc.text('TOTAL:', pageWidth - margins.right - 50, yPos);
            doc.text(total.toFixed(2) + ' MZN', pageWidth - margins.right - 15, yPos, { align: 'right' });
            
            yPos += sectionSpacing * 2;
            
            // ===== MENSAGEM FINAL =====
            if (yPos > pageHeight - margins.bottom - 20) {
                doc.addPage();
                yPos = margins.top;
            }
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Obrigado pela sua preferência!', margins.left, yPos, { align: 'center' });
            
            yPos += lineHeight;
            doc.text('Para qualquer questão, contacte-nos através do email: liteshutter@gmail.com', margins.left, yPos, { align: 'center' });
            
        } else {
            doc.text('Nenhum item na fatura', margins.left, yPos);
        }
        
        // ===== RODAPÉ =====
        const dataGeracao = new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT');
        doc.setFontSize(6);
        doc.text(`Documento gerado eletronicamente em ${dataGeracao} - Facturex System`, margins.left, pageHeight - 10, { align: 'center' });
        
        // Salvar o PDF
        const nomeArquivo = `fatura_${numeroFatura}_${dataFatura.replace(/-/g, '')}.pdf`;
        doc.save(nomeArquivo);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
    }
}