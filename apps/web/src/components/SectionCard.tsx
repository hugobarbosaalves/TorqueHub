/**
 * SectionCard — Reusable card wrapper with icon + title heading.
 *
 * Replaces the duplicated `card > card-body > section-title` pattern
 * found in MediaGallery, OrderItems, VehicleHistory, and VehicleInfo.
 * @module SectionCard
 */

import type { ReactNode } from 'react';

interface SectionCardProps {
  readonly icon: string;
  readonly title: string;
  readonly children: ReactNode;
}

/** Renders a card with a section-title header and children content. */
export function SectionCard({ icon, title, children }: SectionCardProps): ReactNode {
  return (
    <div className="card">
      <div className="card-body">
        <p className="section-title">
          {icon} {title}
        </p>
        {children}
      </div>
    </div>
  );
}
