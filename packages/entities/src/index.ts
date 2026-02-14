/**
 * @torquehub/entities — Domain building blocks: BaseEntity, ValueObject, DomainError.
 * @module entities
 */


/** Domain identifier type — UUID string alias for semantic clarity. */
export type ID = string;


/**
 * Abstract base class for all domain entities.
 * Provides identity comparison via `equals()` and JSON serialization.
 * @typeParam T - The properties interface (must include `id: ID`).
 */
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


/**
 * Abstract base class for immutable value objects.
 * Equality is determined by deep comparison of properties.
 * @typeParam T - The properties record type.
 */
export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}


/**
 * Custom domain error with a machine-readable code.
 * Use this for business-rule violations.
 */
export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
