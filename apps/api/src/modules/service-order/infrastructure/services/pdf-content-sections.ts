/**
 * Seções de conteúdo do PDF de orçamento (itens, observações, rodapé).
 * @module pdf-content-sections
 */
import type { ServiceOrderForQuote } from '../repositories/service-order.repository.js';
import {
  BRAND_PRIMARY,
  COLOR_BG,
  COLOR_DANGER,
  COLOR_MUTED,
  COLOR_SUCCESS,
  formatCurrency,
  formatDateBR,
  drawSeparator,
} from './pdf-constants.js';

/** Renderiza tabela de itens do orçamento. */
export function renderItemsTable(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  const startY = doc.y;

  doc
    .fillColor(BRAND_PRIMARY)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('Itens do Serviço', 50, startY);

  drawSeparator(doc, startY + 18);

  const tableTop = startY + 28;
  const colX = { desc: 65, qty: 340, unit: 400, total: 475 };

  doc.rect(50, tableTop, 495, 22).fill(BRAND_PRIMARY);

  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Descrição', colX.desc, tableTop + 6)
    .text('Qtd', colX.qty, tableTop + 6, { width: 50, align: 'center' })
    .text('Unit.', colX.unit, tableTop + 6, { width: 65, align: 'right' })
    .text('Subtotal', colX.total, tableTop + 6, { width: 65, align: 'right' });

  let rowY = tableTop + 26;
  doc.fontSize(9).font('Helvetica').fillColor('#000000');

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    if (!item) continue;

    if (i % 2 === 0) {
      doc.rect(50, rowY - 2, 495, 20).fill(COLOR_BG);
    }

    const subtotal = item.quantity * item.unitPrice;

    doc
      .fillColor('#000000')
      .text(item.description, colX.desc, rowY + 2, { width: 260 })
      .text(String(item.quantity), colX.qty, rowY + 2, { width: 50, align: 'center' })
      .text(formatCurrency(item.unitPrice), colX.unit, rowY + 2, { width: 65, align: 'right' })
      .font('Helvetica-Bold')
      .text(formatCurrency(subtotal), colX.total, rowY + 2, { width: 65, align: 'right' })
      .font('Helvetica');

    rowY += 22;
    if (rowY > 720) {
      doc.addPage();
      rowY = 50;
    }
  }

  const totalY = rowY + 8;
  doc.rect(340, totalY, 205, 32).fillAndStroke(BRAND_PRIMARY, BRAND_PRIMARY);

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TOTAL', 355, totalY + 8)
    .text(formatCurrency(order.totalAmount), 420, totalY + 8, { width: 115, align: 'right' });

  doc.fillColor('#000000');
  doc.y = totalY + 50;
}

/** Renderiza observações se existirem. */
export function renderObservations(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  if (!order.observations) return;
  if (doc.y > 680) doc.addPage();

  const startY = doc.y;
  doc.fillColor(BRAND_PRIMARY).fontSize(13).font('Helvetica-Bold').text('Observações', 50, startY);

  drawSeparator(doc, startY + 18);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#333333')
    .text(order.observations, 65, startY + 28, { width: 465 });

  doc.y += 15;
}

/** Renderiza rodapé com validade e marca. */
export function renderFooter(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  const footerY = 760;
  drawSeparator(doc, footerY);

  doc.fontSize(8).font('Helvetica').fillColor(COLOR_MUTED);

  if (order.quoteExpiresAt) {
    const isExpired = order.quoteExpiresAt < new Date();
    const expiryText = isExpired
      ? 'ATENÇÃO: Este orçamento está EXPIRADO.'
      : `Orçamento válido até ${formatDateBR(order.quoteExpiresAt)}.`;

    doc
      .fillColor(isExpired ? COLOR_DANGER : COLOR_SUCCESS)
      .font('Helvetica-Bold')
      .text(expiryText, 50, footerY + 8, { width: 495, align: 'center' });
  }

  doc
    .fillColor(COLOR_MUTED)
    .font('Helvetica')
    .text(
      `Documento gerado automaticamente por TorqueHub — ${new Date().toLocaleDateString('pt-BR')}`,
      50,
      footerY + 24,
      { width: 495, align: 'center' },
    );
}
