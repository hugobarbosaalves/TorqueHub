/**
 * @torquehub/contracts — Shared DTOs, request/response types, and API shapes.
 * Consumed by the API (backend) and could be used by a future admin web panel.
 * @module contracts
 */

/** Standard API success response envelope. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

/** Standard API error response. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Data transfer object for a complete service order. */
export interface ServiceOrderDTO {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: ServiceOrderStatus;
  items: ServiceOrderItemDTO[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

/** Data transfer object for a service order line item. */
export interface ServiceOrderItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Allowed status transitions for a service order. */
export type ServiceOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/** Payload for creating a new service order. */
export interface CreateServiceOrderRequest {
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  items: Omit<ServiceOrderItemDTO, 'id' | 'totalPrice'>[];
}

/** Response after successfully creating a service order. */
export interface CreateServiceOrderResponse {
  id: string;
  status: ServiceOrderStatus;
  createdAt: string;
}

/** Data transfer object for a customer record. */
export interface CustomerDTO {
  id: string;
  workshopId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new customer. */
export interface CreateCustomerRequest {
  workshopId: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
}

/** Payload for updating an existing customer. */
export interface UpdateCustomerRequest {
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
}

/** Data transfer object for a vehicle record. */
export interface VehicleDTO {
  id: string;
  workshopId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  mileage: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new vehicle. */
export interface CreateVehicleRequest {
  workshopId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  mileage?: number;
}

/** Payload for updating an existing vehicle. */
export interface UpdateVehicleRequest {
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  mileage?: number;
}
