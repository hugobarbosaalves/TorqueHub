/**
 * QuoteDownload — Card com botão de download do orçamento em PDF.
 * Usa SectionCard e classes CSS globais para consistência visual.
 * @module QuoteDownload
 */

import type { ReactNode } from 'react';
import { SectionCard } from './SectionCard';

/** Props do componente QuoteDownload. */
interface QuoteDownloadProps {
  readonly pdfUrl: string;
}

/** Renderiza seção com botão de download do PDF do orçamento. */
export function QuoteDownload({ pdfUrl }: QuoteDownloadProps): ReactNode {
  return (
    <SectionCard icon="📄" title="Orçamento em PDF">
      <p
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-neutral-500)',
          marginBottom: 'var(--space-8)',
        }}
      >
        Baixe o orçamento completo em PDF com todos os detalhes do serviço, dados do veículo e
        valores discriminados. O documento tem validade de <strong>30 dias</strong>.
      </p>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          padding: 'var(--space-6) var(--space-12)',
        }}
      >
        Baixar Orçamento PDF
      </a>
    </SectionCard>
  );
}
