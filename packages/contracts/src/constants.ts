/**
 * Constantes centralizadas do TorqueHub.
 * Valores reutilizáveis em toda a stack (API, Web, Mobile via espelho Dart).
 * @module constants
 */

/** Status possíveis de uma ordem de serviço. */
export const ORDER_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/** Lista ordenada dos status (para enums Swagger e validações). */
export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

/** Fluxo sequencial de avanço de status (sem CANCELLED). */
export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.PENDING_APPROVAL,
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.COMPLETED,
] as const;

/** Tipos de mídia suportados. */
export const MEDIA_TYPE = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
} as const;

/** Lista dos tipos de mídia (para enums Swagger). */
export const MEDIA_TYPE_VALUES = Object.values(MEDIA_TYPE);

/** Ações de menu popup (mobile/web). */
export const MENU_ACTION = {
  EDIT: 'edit',
  DELETE: 'delete',
  LOGOUT: 'logout',
} as const;
