/**
 * Seção de mídia (fotos) do PDF de orçamento.
 * Renderiza thumbnails das fotos anexadas ao serviço.
 * Suporta imagens locais (filesystem) e remotas (R2/HTTP).
 * @module pdf-media-section
 */
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import type { ServiceOrderForQuote } from '../repositories/service-order.repository.js';
import { BRAND_PRIMARY, COLOR_MUTED, drawSeparator } from './pdf-constants.js';

/** Carrega o buffer de uma imagem (local ou remota). */
async function loadImageBuffer(url: string): Promise<Buffer | null> {
  if (url.startsWith('http')) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
  const imgPath = join(process.cwd(), url);
  if (!existsSync(imgPath)) return null;
  return readFileSync(imgPath);
}

/** Renderiza thumbnails das fotos do serviço no PDF. */
export async function renderMediaSection(
  doc: PDFKit.PDFDocument,
  order: ServiceOrderForQuote,
): Promise<void> {
  const photos = order.media.filter((m) => m.type === 'PHOTO');
  if (photos.length === 0) return;

  if (doc.y > 600) doc.addPage();

  const startY = doc.y;
  doc
    .fillColor(BRAND_PRIMARY)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('Fotos do Serviço', 50, startY);

  drawSeparator(doc, startY + 18);
  doc.y = startY + 28;

  const imgSize = 120;
  const gap = 15;
  const perRow = 3;
  let col = 0;
  let rowStartY = doc.y;

  for (const photo of photos) {
    const imgBuffer = await loadImageBuffer(photo.url);
    if (!imgBuffer) continue;

    try {
      const x = 65 + col * (imgSize + gap);
      doc.image(imgBuffer, x, rowStartY, {
        width: imgSize,
        height: imgSize,
        fit: [imgSize, imgSize],
      });

      if (photo.caption) {
        doc
          .fontSize(7)
          .fillColor(COLOR_MUTED)
          .text(photo.caption, x, rowStartY + imgSize + 2, {
            width: imgSize,
            align: 'center',
          });
      }

      col++;
      if (col >= perRow) {
        col = 0;
        rowStartY += imgSize + 25;
        if (rowStartY > 650) {
          doc.addPage();
          rowStartY = 50;
        }
      }
    } catch {
      /* imagem indisponível — ignorar */
    }
  }

  doc.y = rowStartY + (col > 0 ? imgSize + 30 : 10);
  doc.fillColor('#000000');
}
