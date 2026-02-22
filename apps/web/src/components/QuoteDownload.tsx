/**
 * QuoteDownload — Card com botão de download do orçamento em PDF.
 * Usa SectionCard e classes CSS globais para consistência visual.
 * @module QuoteDownload
 */

import type { ReactNode } from 'react';
import { SectionCard } from './SectionCard';
import { FileText, Download } from './icons';

/** Props do componente QuoteDownload. */
interface QuoteDownloadProps {
  readonly pdfUrl: string;
}

/** Renderiza seção com botão de download do PDF do orçamento. */
export function QuoteDownload({ pdfUrl }: QuoteDownloadProps): ReactNode {
  return (
    <SectionCard icon={<FileText size={20} />} title="Orçamento em PDF">
      <p className="quote-description">
        Baixe o orçamento completo em PDF com todos os detalhes do serviço, dados do veículo e
        valores discriminados. O documento tem validade de <strong>30 dias</strong>.
      </p>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary quote-download-btn"
      >
        <Download size={18} /> Baixar Orçamento PDF
      </a>
    </SectionCard>
  );
}
