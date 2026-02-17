/**
 * API service — Fetches public order data for the client portal.
 * @module api-service
 */

const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:3333';

/** A line item within a service order. */
export interface ServiceOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Summary of the vehicle associated with the order. */
export interface VehicleSummary {
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
}

/** A media record attached to a service order. */
export interface MediaRecord {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  url: string;
  caption: string | null;
  createdAt: string;
}

/** Full public order detail returned by the API. */
export interface PublicOrderDetail {
  id: string;
  description: string;
  status: string;
  observations: string | null;
  totalAmount: number;
  items: ServiceOrderItem[];
  vehicle: VehicleSummary;
  customerName: string;
  media: MediaRecord[];
  createdAt: string;
  updatedAt: string;
}

/** Simplified order for vehicle history listing. */
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

/** Fetches a public order detail by its public token. */
export async function getOrderByToken(token: string): Promise<PublicOrderDetail> {
  const res = await fetch(`${API_URL}/public/orders/${token}`);
  const json = (await res.json()) as { data: PublicOrderDetail; meta?: { error?: string } };
  if (!res.ok) throw new Error(json.meta?.error ?? 'Ordem não encontrada');
  return json.data;
}

/** Fetches vehicle service history via the public token. */
export async function getVehicleHistory(token: string): Promise<ServiceOrder[]> {
  const res = await fetch(`${API_URL}/public/orders/${token}/vehicle-history`);
  const json = (await res.json()) as { data: ServiceOrder[]; meta?: { error?: string } };
  if (!res.ok) throw new Error(json.meta?.error ?? 'Histórico não encontrado');
  return json.data;
}

/** Builds the full URL for a media file. */
export function mediaUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Returns the full URL for downloading the quote PDF. */
export function getQuotePdfUrl(token: string): string {
  return `${API_URL}/public/orders/${token}/pdf`;
}
