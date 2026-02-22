/**
 * MediaGallery — Displays photos/videos attached to a service order.
 * Supports a lightbox for full-size viewing.
 * @module MediaGallery
 */

import { useState, type ReactNode } from 'react';
import type { MediaRecord } from '../services/api';
import { mediaUrl } from '../services/api';
import { SectionCard } from './SectionCard';
import { MEDIA_TYPE } from '../utils/constants';
import { Camera } from './icons';

interface MediaGalleryProps {
  readonly media: MediaRecord[];
}

/** Renders a responsive photo grid with lightbox overlay. */
export function MediaGallery({ media }: MediaGalleryProps): ReactNode {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const photos = media.filter((mediaItem) => mediaItem.type === MEDIA_TYPE.PHOTO);

  if (photos.length === 0) return null;

  return (
    <SectionCard icon={<Camera size={20} />} title="Fotos do Serviço">
      <div className="media-grid">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            className="media-grid-btn"
            onClick={() => {
              setLightboxIdx(idx);
            }}
          >
            <img
              src={mediaUrl(photo.url)}
              alt={photo.caption ?? `Foto ${String(idx + 1)}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && photos[lightboxIdx] && (
        <button
          type="button"
          className="lightbox"
          onClick={() => {
            setLightboxIdx(null);
          }}
        >
          <img
            src={mediaUrl(photos[lightboxIdx].url)}
            alt={photos[lightboxIdx].caption ?? 'Foto em tamanho real'}
          />
        </button>
      )}
    </SectionCard>
  );
}
