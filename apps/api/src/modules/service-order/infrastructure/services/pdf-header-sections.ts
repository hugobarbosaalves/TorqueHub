/**
 * Seções superiores do PDF de orçamento (header, info, veículo, cliente).
 * @module pdf-header-sections
 */
import type { ServiceOrderForQuote } from '../repositories/service-order.repository.js';
import {
  BRAND_PRIMARY,
  COLOR_BG,
  COLOR_BORDER,
  COLOR_MUTED,
  getStatusColor,
  getStatusLabel,
  formatDateBR,
  formatDocument,
  drawSeparator,
} from './pdf-constants.js';

/** Renderiza o cabeçalho com dados da oficina. */
export function renderHeader(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  const { workshop } = order;

  doc.rect(0, 0, 595.28, 100).fill(BRAND_PRIMARY);

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(workshop.name, 50, 25, { width: 495 });

  doc.fontSize(10).font('Helvetica');

  if (workshop.document) {
    doc.text(`CNPJ/CPF: ${formatDocument(workshop.document)}`, 50, 52);
  }

  const contactParts: string[] = [];
  if (workshop.phone) contactParts.push(workshop.phone);
  if (workshop.email) contactParts.push(workshop.email);
  if (contactParts.length > 0) {
    doc.text(contactParts.join(' | '), 50, 66);
  }

  if (workshop.address) {
    doc.text(workshop.address, 50, 80);
  }

  doc.fillColor('#000000');
  doc.y = 115;
}

/** Renderiza box de informações do orçamento com status. */
export function renderQuoteInfo(
  doc: PDFKit.PDFDocument,
  order: ServiceOrderForQuote,
  issuedByName: string | null,
): void {
  const startY = doc.y;
  const statusColor = getStatusColor(order.status);
  const statusLabel = getStatusLabel(order.status);

  doc.rect(50, startY, 495, 85).fillAndStroke(COLOR_BG, COLOR_BORDER);

  doc
    .fillColor(BRAND_PRIMARY)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('ORÇAMENTO DE SERVIÇO', 65, startY + 10);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLOR_MUTED)
    .text(`Emitido em: ${formatDateBR(order.createdAt)}`, 65, startY + 32);

  if (order.quoteExpiresAt) {
    doc.text(`Válido até: ${formatDateBR(order.quoteExpiresAt)}`, 65, startY + 45);
  }

  if (issuedByName) {
    doc.text(`Emitido por: ${issuedByName}`, 65, startY + 58);
  }

  doc.roundedRect(380, startY + 12, 150, 28, 4).fill(statusColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(statusLabel, 380, startY + 19, { width: 150, align: 'center' });

  doc.fillColor('#000000');
  doc.y = startY + 100;
}

/** Renderiza seção de dados do veículo. */
export function renderVehicleSection(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  const startY = doc.y;
  const { vehicle } = order;

  doc.fillColor(BRAND_PRIMARY).fontSize(13).font('Helvetica-Bold').text('Veículo', 50, startY);

  drawSeparator(doc, startY + 18);
  doc.y = startY + 25;

  const rows = [
    ['Veículo', `${String(vehicle.brand)} ${String(vehicle.model)}`],
    ['Placa', vehicle.plate],
  ];
  if (vehicle.year) rows.push(['Ano', String(vehicle.year)]);
  if (vehicle.color) rows.push(['Cor', vehicle.color]);

  doc.fontSize(10).font('Helvetica');

  for (const [label, value] of rows) {
    doc
      .fillColor(COLOR_MUTED)
      .text(`${String(label)}:`, 65, doc.y, { continued: true })
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(`  ${String(value)}`)
      .font('Helvetica');
  }

  doc.y += 10;
}

/** Renderiza seção de dados do cliente. */
export function renderCustomerSection(doc: PDFKit.PDFDocument, order: ServiceOrderForQuote): void {
  const startY = doc.y;

  doc.fillColor(BRAND_PRIMARY).fontSize(13).font('Helvetica-Bold').text('Cliente', 50, startY);

  drawSeparator(doc, startY + 18);
  doc.y = startY + 25;

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLOR_MUTED)
    .text('Nome:', 65, doc.y, { continued: true })
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(`  ${String(order.customer.name)}`)
    .font('Helvetica');

  doc.y += 10;
}
