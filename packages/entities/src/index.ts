// ── ID Type ─────────────────────────────────────────────────────────────────

export type ID = string;

// ── Base Entity ─────────────────────────────────────────────────────────────

export abstract class BaseEntity<T extends { id: ID }> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  get id(): ID {
    return this.props.id;
  }

  public equals(other: BaseEntity<T>): boolean {
    if (other === this) return true;
    return this.id === other.id;
  }

  public toJSON(): T {
    return { ...this.props };
  }
}

// ── Value Object ────────────────────────────────────────────────────────────

export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}

// ── Domain Error ────────────────────────────────────────────────────────────

export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
