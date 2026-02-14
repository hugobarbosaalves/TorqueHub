const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3333';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Workshop {
  id: string;
  name: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface Customer {
  id: string;
  workshopId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
}

export interface Vehicle {
  id: string;
  workshopId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  mileage: number | null;
}

export interface ServiceOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: string;
  observations: string | null;
  totalAmount: number;
  publicToken: string;
  items: ServiceOrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface CreateServiceOrderInput {
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

// ── API Functions ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.meta?.error ?? `HTTP ${res.status}`);
  return json.data as T;
}

export async function getWorkshops(): Promise<Workshop[]> {
  return apiFetch('/workshops');
}

export async function getCustomers(workshopId: string): Promise<Customer[]> {
  return apiFetch(`/workshops/${workshopId}/customers`);
}

export async function getVehicles(workshopId: string, customerId?: string): Promise<Vehicle[]> {
  const qs = customerId ? `?customerId=${customerId}` : '';
  return apiFetch(`/workshops/${workshopId}/vehicles${qs}`);
}

export async function getServiceOrders(workshopId?: string): Promise<ServiceOrder[]> {
  const qs = workshopId ? `?workshopId=${workshopId}` : '';
  return apiFetch(`/service-orders${qs}`);
}

export async function createServiceOrder(input: CreateServiceOrderInput): Promise<ServiceOrder> {
  return apiFetch('/service-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<{ id: string; status: string }> {
  return apiFetch(`/service-orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function deleteServiceOrder(id: string): Promise<void> {
  await apiFetch(`/service-orders/${id}`, { method: 'DELETE' });
}

