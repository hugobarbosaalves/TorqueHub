/**
 * @torquehub/contracts — Shared DTOs, request/response types, and API shapes.
 * Consumed by the API (backend) and could be used by a future admin web panel.
 * @module contracts
 */

export {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_FLOW,
  MEDIA_TYPE,
  MEDIA_TYPE_VALUES,
  MENU_ACTION,
  USER_ROLE,
} from './constants.js';

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
  observations: string | null;
  items: ServiceOrderItemDTO[];
  totalAmount: number;
  publicToken: string | null;
  customerName: string | null;
  vehiclePlate: string | null;
  vehicleSummary: string | null;
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

/** Payload for updating an existing service order (only DRAFT). */
export interface UpdateServiceOrderRequest {
  description?: string;
  observations?: string;
  items?: Omit<ServiceOrderItemDTO, 'id' | 'totalPrice'>[];
}

/** Response after successfully creating a service order. */
export interface CreateServiceOrderResponse {
  id: string;
  status: ServiceOrderStatus;
  publicToken: string | null;
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
  customerName: string | null;
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
  customerId?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  mileage?: number;
}

/** Allowed media types. */
export type MediaType = 'PHOTO' | 'VIDEO';

/** Data transfer object for a media record. */
export interface MediaDTO {
  id: string;
  serviceOrderId: string;
  type: MediaType;
  url: string;
  caption: string | null;
  createdAt: string;
}

/** Response after uploading a media file. */
export interface UploadMediaResponse {
  id: string;
  type: MediaType;
  url: string;
  caption: string | null;
  createdAt: string;
}

/** Summary of vehicle info exposed in the public order detail. */
export interface PublicVehicleSummary {
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
}

/** Enriched public-facing order detail with vehicle, customer, and media info. */
export interface PublicOrderDetailDTO extends ServiceOrderDTO {
  vehicle: PublicVehicleSummary;
  customerName: string;
  media: MediaDTO[];
}

/** Workshop info exposed in quote PDF. */
export interface QuoteWorkshopInfo {
  name: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

/** Data needed to generate a quote PDF. */
export interface QuotePdfDataDTO extends PublicOrderDetailDTO {
  workshop: QuoteWorkshopInfo;
  quoteExpiresAt: string | null;
  issuedByUser: string | null;
}

// ─── Auth ──────────────────────────────────────────────────────

/** Allowed user roles. */
export type UserRole = 'PLATFORM_ADMIN' | 'WORKSHOP_OWNER' | 'MECHANIC';

/** Values list for validation/Swagger. */
export const USER_ROLE_VALUES: readonly UserRole[] = [
  'PLATFORM_ADMIN',
  'WORKSHOP_OWNER',
  'MECHANIC',
] as const;

/** Data transfer object for a user record (no password). */
export interface UserDTO {
  id: string;
  workshopId: string | null;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
}

/** Payload for logging in. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload for registering a new user. */
export interface RegisterRequest {
  workshopId?: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/** Response after successful authentication. */
export interface AuthResponse {
  token: string;
  user: UserDTO;
}

/** Payload for changing the current user's password. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** JWT payload shape — stored inside the token. */
export interface JwtPayload {
  sub: string;
  workshopId: string | null;
  role: UserRole;
}

// ─── Admin ─────────────────────────────────────────────────────

/** Data transfer object for a workshop record. */
export interface WorkshopDTO {
  id: string;
  name: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new workshop via admin. */
export interface CreateWorkshopRequest {
  name: string;
  document: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Payload for updating a workshop. */
export interface UpdateWorkshopRequest {
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Payload for creating a user within a workshop (admin). */
export interface CreateWorkshopUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'WORKSHOP_OWNER' | 'MECHANIC';
}

/** Platform-wide metrics returned by admin dashboard. */
export interface PlatformMetricsDTO {
  totalWorkshops: number;
  totalUsers: number;
  totalServiceOrders: number;
  totalCustomers: number;
}
