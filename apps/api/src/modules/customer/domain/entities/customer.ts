import type { ID } from '@torquehub/entities';

export interface CustomerProps {
  id: ID;
  workshopId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer {
  private readonly props: CustomerProps;

  private constructor(props: CustomerProps) {
    this.props = props;
  }

  static create(input: {
    id: ID;
    workshopId: string;
    name: string;
    document?: string;
    phone?: string;
    email?: string;
  }): Customer {
    const now = new Date();
    return new Customer({
      ...input,
      document: input.document ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): ID {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get workshopId(): string {
    return this.props.workshopId;
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
