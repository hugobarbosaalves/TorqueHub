// ── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ── Service Order Types ─────────────────────────────────────────────────────

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

export interface ServiceOrderItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type ServiceOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CreateServiceOrderRequest {
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  items: Omit<ServiceOrderItemDTO, 'id' | 'totalPrice'>[];
}

export interface CreateServiceOrderResponse {
  id: string;
  status: ServiceOrderStatus;
  createdAt: string;
}

// ── Customer Types ──────────────────────────────────────────────────────────

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

export interface CreateCustomerRequest {
  workshopId: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
}

// ── Vehicle Types ───────────────────────────────────────────────────────────

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

export interface UpdateVehicleRequest {
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  mileage?: number;
}
