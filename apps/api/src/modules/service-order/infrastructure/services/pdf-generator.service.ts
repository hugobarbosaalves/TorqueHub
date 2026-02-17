/**
 * PDF Quote Generator — Orquestrador principal.
 * Monta o documento PDFKit e delega seções para módulos especializados.
 * @module pdf-generator-service
 */
import PDFDocument from 'pdfkit';
import type { ServiceOrderForQuote } from '../repositories/service-order.repository.js';
import {
  renderHeader,
  renderQuoteInfo,
  renderVehicleSection,
  renderCustomerSection,
} from './pdf-header-sections.js';
import { renderItemsTable, renderObservations, renderFooter } from './pdf-content-sections.js';
import { renderMediaSection } from './pdf-media-section.js';

/** Gera o buffer PDF completo de um orçamento de serviço. */
export async function generateQuotePdf(
  order: ServiceOrderForQuote,
  issuedByName: string | null,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Orçamento - ${String(order.description)}`,
      Author: String(order.workshop.name),
      Subject: 'Orçamento de Serviço Automotivo',
      Creator: 'TorqueHub',
    },
  });

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);
  });

  renderHeader(doc, order);
  renderQuoteInfo(doc, order, issuedByName);
  renderVehicleSection(doc, order);
  renderCustomerSection(doc, order);
  renderItemsTable(doc, order);
  await renderMediaSection(doc, order);
  renderObservations(doc, order);
  renderFooter(doc, order);

  doc.end();
  return finished;
}
