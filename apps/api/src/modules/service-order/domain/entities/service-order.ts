import type { ID } from '@torquehub/entities';
import type { ServiceOrderStatus } from '@torquehub/contracts';

export interface ServiceOrderProps {
  id: ID;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: ServiceOrderStatus;
  items: ServiceOrderItemProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceOrderItemProps {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
}

export class ServiceOrder {
  private readonly props: ServiceOrderProps;

  private constructor(props: ServiceOrderProps) {
    this.props = props;
  }

  static create(input: {
    id: ID;
    workshopId: string;
    customerId: string;
    vehicleId: string;
    description: string;
    items: ServiceOrderItemProps[];
  }): ServiceOrder {
    const now = new Date();
    return new ServiceOrder({
      ...input,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): ID {
    return this.props.id;
  }

  get status(): ServiceOrderStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get totalAmount(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  toJSON(): ServiceOrderProps {
    return { ...this.props };
  }
}
