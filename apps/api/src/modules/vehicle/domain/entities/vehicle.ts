import type { ID } from '@torquehub/entities';

/** Properties that define a Vehicle entity. */
export interface VehicleProps {
  id: ID;
  workshopId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  mileage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Vehicle domain entity with factory method and display formatting. */
export class Vehicle {
  private readonly props: VehicleProps;

  private constructor(props: VehicleProps) {
    this.props = props;
  }

  static create(input: {
    id: ID;
    workshopId: string;
    customerId: string;
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
    mileage?: number;
  }): Vehicle {
    const now = new Date();
    return new Vehicle({
      ...input,
      year: input.year ?? null,
      color: input.color ?? null,
      mileage: input.mileage ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): ID {
    return this.props.id;
  }

  get plate(): string {
    return this.props.plate;
  }

  get displayName(): string {
    return `${this.props.brand} ${this.props.model} — ${this.props.plate}`;
  }

  toJSON(): VehicleProps {
    return { ...this.props };
  }
}
