/**
 * MediaGallery — Displays photos/videos attached to a service order.
 * Supports a lightbox for full-size viewing.
 * @module MediaGallery
 */

import { useState, type ReactNode } from 'react';
import type { MediaRecord } from '../services/api';
import { mediaUrl } from '../services/api';
import { SectionCard } from './SectionCard';

interface MediaGalleryProps {
  readonly media: MediaRecord[];
}

/** Renders a responsive photo grid with lightbox overlay. */
export function MediaGallery({ media }: MediaGalleryProps): ReactNode {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const photos = media.filter((m) => m.type === 'PHOTO');

  if (photos.length === 0) return null;

  return (
    <SectionCard icon="📸" title="Fotos do Serviço">
      <div className="media-grid">
        {photos.map((photo, idx) => (
          <img
            key={photo.id}
            src={mediaUrl(photo.url)}
            alt={photo.caption ?? `Foto ${String(idx + 1)}`}
            loading="lazy"
            onClick={() => {
              setLightboxIdx(idx);
            }}
          />
        ))}
      </div>

      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="lightbox"
          onClick={() => {
            setLightboxIdx(null);
          }}
        >
          <img
            src={mediaUrl(photos[lightboxIdx].url)}
            alt={photos[lightboxIdx].caption ?? 'Foto em tamanho real'}
          />
        </div>
      )}
    </SectionCard>
  );
}
