/**
 * VehicleInfo — Displays vehicle details in a compact card.
 * Shows plate, brand/model, year, and color.
 * @module VehicleInfo
 */

import type { ReactNode } from 'react';
import type { VehicleSummary } from '../services/api';
import { SectionCard } from './SectionCard';
import { Car, User } from './icons';

interface VehicleInfoProps {
  readonly vehicle: VehicleSummary;
  readonly customerName: string;
}

/** Renders vehicle and customer information in a styled card. */
export function VehicleInfo({ vehicle, customerName }: VehicleInfoProps): ReactNode {
  const vehicleName = `${vehicle.brand} ${vehicle.model}`;
  const details = [vehicle.year ? `Ano ${String(vehicle.year)}` : null, vehicle.color]
    .filter(Boolean)
    .join(' · ');

  return (
    <SectionCard icon={<Car size={20} />} title="Veículo">
      <div className="vehicle-row">
        <div>
          <p className="vehicle-name">{vehicleName}</p>
          {details && <p className="vehicle-details">{details}</p>}
        </div>
        <div className="vehicle-plate">{vehicle.plate}</div>
      </div>
      <p className="vehicle-customer">
        <User size={14} /> Cliente: <strong>{customerName}</strong>
      </p>
    </SectionCard>
  );
}
