/// Constantes centralizadas do TorqueHub para o app mobile.
///
/// Valores reutilizáveis em todas as telas e widgets,
/// espelhando `packages/contracts/src/constants.ts`.
library;

/// Status possíveis de uma ordem de serviço.
class OrderStatus {
  OrderStatus._();

  static const draft = 'DRAFT';
  static const pendingApproval = 'PENDING_APPROVAL';
  static const approved = 'APPROVED';
  static const inProgress = 'IN_PROGRESS';
  static const completed = 'COMPLETED';
  static const cancelled = 'CANCELLED';

  /// Todos os status válidos.
  static const values = [
    draft,
    pendingApproval,
    approved,
    inProgress,
    completed,
    cancelled,
  ];

  /// Fluxo sequencial de avanço (sem CANCELLED).
  static const flow = [draft, pendingApproval, approved, inProgress, completed];
}

/// Tipos de mídia suportados.
class MediaType {
  MediaType._();

  static const photo = 'PHOTO';
  static const video = 'VIDEO';
}

/// Papéis de usuário no sistema multi-tenant.
class UserRole {
  UserRole._();

  /// Administrador da plataforma — acessa todas as oficinas.
  static const platformAdmin = 'PLATFORM_ADMIN';

  /// Dono da oficina — acessa apenas sua oficina.
  static const workshopOwner = 'WORKSHOP_OWNER';

  /// Mecânico — acessa apenas OS atribuídas.
  static const mechanic = 'MECHANIC';
}

/// Ações de menu popup reutilizáveis.
class MenuAction {
  MenuAction._();

  static const edit = 'edit';
  static const delete = 'delete';
  static const logout = 'logout';
}
