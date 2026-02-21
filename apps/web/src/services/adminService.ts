/**
 * Admin API service — fetches data for the admin portal.
 * All calls require PLATFORM_ADMIN JWT.
 * @module adminService
 */

import type {
  WorkshopDTO,
  UserDTO,
  PlatformMetricsDTO,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  CreateWorkshopUserRequest,
} from '@torquehub/contracts';
import { authFetch } from './authService';

/** Standard API response envelope. */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

/** Fetches platform-wide metrics. */
export async function getMetrics(): Promise<PlatformMetricsDTO> {
  const res = await authFetch('/admin/metrics');
  const json = (await res.json()) as ApiResponse<PlatformMetricsDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao carregar métricas');
  return json.data;
}

/** Lists all workshops. */
export async function listWorkshops(): Promise<WorkshopDTO[]> {
  const res = await authFetch('/admin/workshops');
  const json = (await res.json()) as ApiResponse<WorkshopDTO[]>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao listar oficinas');
  return json.data;
}

/** Fetches a single workshop by ID. */
export async function getWorkshop(id: string): Promise<WorkshopDTO> {
  const res = await authFetch(`/admin/workshops/${id}`);
  const json = (await res.json()) as ApiResponse<WorkshopDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Oficina não encontrada');
  return json.data;
}

/** Creates a new workshop. */
export async function createWorkshop(data: CreateWorkshopRequest): Promise<WorkshopDTO> {
  const res = await authFetch('/admin/workshops', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<WorkshopDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao criar oficina');
  return json.data;
}

/** Updates a workshop. */
export async function updateWorkshop(
  id: string,
  data: UpdateWorkshopRequest,
): Promise<WorkshopDTO> {
  const res = await authFetch(`/admin/workshops/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<WorkshopDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao atualizar oficina');
  return json.data;
}

/** Lists users of a workshop. */
export async function listWorkshopUsers(workshopId: string): Promise<UserDTO[]> {
  const res = await authFetch(`/admin/workshops/${workshopId}/users`);
  const json = (await res.json()) as ApiResponse<UserDTO[]>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao listar usuários');
  return json.data;
}

/** Creates a user within a workshop. */
export async function createWorkshopUser(
  workshopId: string,
  data: CreateWorkshopUserRequest,
): Promise<UserDTO> {
  const res = await authFetch(`/admin/workshops/${workshopId}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<UserDTO>;
  if (!res.ok)
    throw new Error((json.meta?.['error'] as string | undefined) ?? 'Erro ao criar usuário');
  return json.data;
}
