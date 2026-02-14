const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3333';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ServiceOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  description: string;
  status: string;
  observations: string | null;
  totalAmount: number;
  items: ServiceOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Busca uma ordem de serviço pelo token público.
 * Usado pelo cliente para acessar seu orçamento/serviço.
 */
export async function getOrderByToken(token: string): Promise<ServiceOrder> {
  const res = await fetch(`${API_URL}/public/orders/${token}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.meta?.error ?? `Ordem não encontrada`);
  return json.data as ServiceOrder;
}

/**
 * Busca o histórico de serviços de um veículo pelo token público.
 */
export async function getVehicleHistory(token: string): Promise<ServiceOrder[]> {
  const res = await fetch(`${API_URL}/public/orders/${token}/vehicle-history`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.meta?.error ?? `Histórico não encontrado`);
  return json.data as ServiceOrder[];
}
