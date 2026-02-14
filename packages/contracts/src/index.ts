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
