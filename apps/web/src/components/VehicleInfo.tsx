/**
 * VehicleInfo — Displays vehicle details in a compact card.
 * Shows plate, brand/model, year, and color.
 * @module VehicleInfo
 */

import type { ReactNode } from 'react';
import type { VehicleSummary } from '../services/api';

interface VehicleInfoProps {
  vehicle: VehicleSummary;
  customerName: string;
}

/** Renders vehicle and customer information in a styled card. */
export function VehicleInfo({ vehicle, customerName }: VehicleInfoProps): ReactNode {
  const vehicleName = `${vehicle.brand} ${vehicle.model}`;
  const details = [
    vehicle.year ? `Ano ${String(vehicle.year)}` : null,
    vehicle.color,
  ].filter(Boolean).join(' · ');

  return (
    <div className="card">
      <div className="card-body">
        <p className="section-title">🚗 Veículo</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{vehicleName}</p>
            {details && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{details}</p>}
          </div>
          <div style={{
            background: 'var(--color-primary)', color: '#fff', padding: '6px 14px',
            borderRadius: 6, fontWeight: 700, fontSize: 16, letterSpacing: 1, alignSelf: 'center',
          }}>
            {vehicle.plate}
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          👤 Cliente: <strong>{customerName}</strong>
        </p>
      </div>
    </div>
  );
}
