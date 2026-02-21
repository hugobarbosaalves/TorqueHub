/**
 * Backoffice API service — fetches data for the workshop owner portal.
 * Calls require WORKSHOP_OWNER JWT.
 * @module backofficeService
 */

import type {
  ServiceOrderDTO,
  CustomerDTO,
  VehicleDTO,
  UserDTO,
  CreateServiceOrderRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateVehicleRequest,
} from '@torquehub/contracts';
import { authFetch } from './authService';

/** Standard API response envelope. */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

// ─── Service Orders ───

/** Lists all service orders for the current workshop. */
export async function listOrders(): Promise<ServiceOrderDTO[]> {
  const res = await authFetch('/service-orders');
  const json = (await res.json()) as ApiResponse<ServiceOrderDTO[]>;
  if (!res.ok) throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro');
  return json.data;
}

/** Creates a new service order. */
export async function createOrder(
  data: Omit<CreateServiceOrderRequest, 'workshopId'>,
): Promise<ServiceOrderDTO> {
  const res = await authFetch('/service-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<ServiceOrderDTO>;
  if (!res.ok) throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao criar OS');
  return json.data;
}

/** Updates service order status. */
export async function updateOrderStatus(orderId: string, status: string): Promise<ServiceOrderDTO> {
  const res = await authFetch(`/service-orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  const json = (await res.json()) as ApiResponse<ServiceOrderDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao atualizar status');
  return json.data;
}

// ─── Customers ───

/** Lists all customers for the current workshop. */
export async function listCustomers(): Promise<CustomerDTO[]> {
  const res = await authFetch('/customers');
  const json = (await res.json()) as ApiResponse<CustomerDTO[]>;
  if (!res.ok) throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro');
  return json.data;
}

/** Creates a new customer. */
export async function createCustomer(
  data: Omit<CreateCustomerRequest, 'workshopId'>,
): Promise<CustomerDTO> {
  const res = await authFetch('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<CustomerDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao criar cliente');
  return json.data;
}

/** Updates a customer. */
export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerRequest,
): Promise<CustomerDTO> {
  const res = await authFetch(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<CustomerDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao atualizar cliente');
  return json.data;
}

/** Deletes a customer. */
export async function deleteCustomer(customerId: string): Promise<void> {
  const res = await authFetch(`/customers/${customerId}`, { method: 'DELETE' });
  if (!res.ok) {
    const json = (await res.json()) as ApiResponse<unknown>;
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao excluir cliente');
  }
}

// ─── Vehicles ───

/** Lists all vehicles for the current workshop. */
export async function listVehicles(): Promise<VehicleDTO[]> {
  const res = await authFetch('/vehicles');
  const json = (await res.json()) as ApiResponse<VehicleDTO[]>;
  if (!res.ok) throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro');
  return json.data;
}

/** Creates a new vehicle. */
export async function createVehicle(
  data: Omit<CreateVehicleRequest, 'workshopId'>,
): Promise<VehicleDTO> {
  const res = await authFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<VehicleDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao criar veículo');
  return json.data;
}

// ─── Team (Users) ───

/** Lists workshop team members via lookup endpoint. */
export async function listTeam(workshopId: string): Promise<UserDTO[]> {
  const res = await authFetch(`/admin/workshops/${workshopId}/users`);
  const json = (await res.json()) as ApiResponse<UserDTO[]>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao listar equipe');
  return json.data;
}
