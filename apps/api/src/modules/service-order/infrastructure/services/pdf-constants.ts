/**
 * Constantes e utilitários compartilhados para geração de PDF.
 * Cores derivadas do design-tokens, formatadores e helpers visuais.
 * @module pdf-constants
 */
import { colors, statusConfig } from '@torquehub/design-tokens';

/** Cor primária da marca TorqueHub (derivada do design-tokens). */
export const BRAND_PRIMARY = colors.brand.primary;

/** Cor de destaque/accent. */
export const BRAND_ACCENT = colors.brand.accent;

/** Cor de sucesso. */
export const COLOR_SUCCESS = colors.semantic.success;

/** Cor de alerta. */
export const COLOR_WARNING = colors.semantic.warning;

/** Cor de perigo/erro. */
export const COLOR_DANGER = colors.semantic.danger;

/** Cor de texto secundário/muted. */
export const COLOR_MUTED = colors.neutral['500'] ?? '#64748B';

/** Cor de borda. */
export const COLOR_BORDER = colors.surface.border;

/** Cor de fundo alternado. */
export const COLOR_BG = colors.surface.background;

/** Retorna a cor hex do status usando statusConfig centralizado. */
export function getStatusColor(status: string): string {
  return statusConfig[status]?.color ?? COLOR_MUTED;
}

/** Retorna o label do status usando statusConfig centralizado. */
export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label ?? status;
}

/** Formata centavos para moeda BRL. */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Formata data para formato brasileiro extenso. */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Formata CNPJ/CPF para exibição com máscara. */
export function formatDocument(doc: string): string {
  const digits = doc.replaceAll(/\D/g, '');
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return doc;
}

/** Desenha uma linha separadora horizontal no PDF. */
export function drawSeparator(pdfDoc: PDFKit.PDFDocument, y: number): void {
  pdfDoc.strokeColor(COLOR_BORDER).lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
}
