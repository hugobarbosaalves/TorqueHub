/**
 * Admin WorkshopDetailPage — view/edit/delete a workshop and manage its users.
 * @module AdminWorkshopDetailPage
 */

import { type ReactNode, useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
  WorkshopDTO,
  UserDTO,
  CreateWorkshopUserRequest,
  UpdateWorkshopRequest,
  UpdateWorkshopUserRequest,
} from '@torquehub/contracts';
import {
  getWorkshop,
  updateWorkshop,
  deleteWorkshop,
  listWorkshopUsers,
  createWorkshopUser,
  updateWorkshopUser,
  deleteWorkshopUser,
} from '../../services/adminService';
import {
  ArrowLeft,
  Pencil,
  XCircle,
  Plus,
  Loader2,
  Trash2,
} from '../../components/icons';

/** Maps role to display label. */
function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    PLATFORM_ADMIN: 'Admin Plataforma',
    WORKSHOP_OWNER: 'Dono da Oficina',
    MECHANIC: 'Mecânico',
  };
  return labels[role] ?? role;
}

/** Workshop detail page with full CRUD. */
export function WorkshopDetailPage(): ReactNode {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workshop, setWorkshop] = useState<WorkshopDTO | null>(null);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Edit workshop form state. */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateWorkshopRequest>({});
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  /** Delete workshop state. */
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** New user form state. */
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState<CreateWorkshopUserRequest>({
    name: '',
    email: '',
    password: '',
    role: 'WORKSHOP_OWNER',
  });
  const [userFormError, setUserFormError] = useState('');
  const [userSaving, setUserSaving] = useState(false);

  /** Edit user state. */
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<UpdateWorkshopUserRequest>({});
  const [editUserError, setEditUserError] = useState('');
  const [editUserSaving, setEditUserSaving] = useState(false);

  /** Delete user state. */
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void loadData(id);
  }, [id]);

  /** Loads workshop and users. */
  async function loadData(workshopId: string): Promise<void> {
    setLoading(true);
    try {
      const [workshopData, usersData] = await Promise.all([
        getWorkshop(workshopId),
        listWorkshopUsers(workshopId),
      ]);
      setWorkshop(workshopData);
      setUsers(usersData);
      setEditForm({
        name: workshopData.name,
        document: workshopData.document,
        phone: workshopData.phone ?? '',
        email: workshopData.email ?? '',
        address: workshopData.address ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar oficina');
    } finally {
      setLoading(false);
    }
  }

  /** Handles workshop update. */
  async function handleUpdate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!id) return;
    setEditError('');
    setEditSaving(true);
    try {
      const updated = await updateWorkshop(id, editForm);
      setWorkshop(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setEditSaving(false);
    }
  }

  /** Handles user creation. */
  async function handleCreateUser(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!id) return;
    setUserFormError('');
    setUserSaving(true);
    try {
      await createWorkshopUser(id, userForm);
      setShowUserForm(false);
      setUserForm({ name: '', email: '', password: '', role: 'WORKSHOP_OWNER' });
      const updatedUsers = await listWorkshopUsers(id);
      setUsers(updatedUsers);
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setUserSaving(false);
    }
  }

  /** Handles workshop deletion. */
  async function handleDeleteWorkshop(): Promise<void> {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteWorkshop(id);
      void navigate('/admin/workshops');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir oficina');
      setDeleting(false);
    }
  }

  /** Starts inline editing of a user. */
  function startEditUser(user: UserDTO): void {
    setEditingUserId(user.id);
    const formData: UpdateWorkshopUserRequest = { name: user.name, email: user.email };
    if (user.role !== 'PLATFORM_ADMIN') {
      formData.role = user.role;
    }
    setEditUserForm(formData);
    setEditUserError('');
  }

  /** Handles user update. */
  async function handleUpdateUser(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!id || !editingUserId) return;
    setEditUserError('');
    setEditUserSaving(true);
    try {
      await updateWorkshopUser(id, editingUserId, editUserForm);
      setEditingUserId(null);
      const updatedUsers = await listWorkshopUsers(id);
      setUsers(updatedUsers);
    } catch (err) {
      setEditUserError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setEditUserSaving(false);
    }
  }

  /** Handles user deletion. */
  async function handleDeleteUser(userId: string): Promise<void> {
    if (!id) return;
    setDeletingUserId(userId);
    try {
      await deleteWorkshopUser(id, userId);
      const updatedUsers = await listWorkshopUsers(id);
      setUsers(updatedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    } finally {
      setDeletingUserId(null);
    }
  }

  if (error) return <div className="page-error">{error}</div>;
  if (loading || !workshop) return <div className="spinner" />;

  return (
    <div className="page">
      <button
        className="btn-back"
        type="button"
        onClick={() => {
          void navigate('/admin/workshops');
        }}
      >
        <ArrowLeft size={14} /> Voltar para oficinas
      </button>

      <div className="page-header-row">
        <h1 className="page-title">{workshop.name}</h1>
        <div className="page-header-actions">
          <button
            className={editing ? 'btn btn-secondary' : 'btn btn-outline'}
            type="button"
            onClick={() => {
              setEditing(!editing);
              setDeleteConfirm(false);
            }}
          >
            {editing ? (
              <>
                <XCircle size={16} /> Cancelar
              </>
            ) : (
              <>
                <Pencil size={16} /> Editar
              </>
            )}
          </button>
          {!editing && (
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                setDeleteConfirm(!deleteConfirm);
              }}
            >
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="card card-danger card-gap-bottom">
          <div className="card-body">
            <p className="delete-confirm-text">
              Tem certeza que deseja excluir a oficina <strong>{workshop.name}</strong>?
              Esta ação é irreversível e removerá todos os dados associados.
            </p>
            <div className="delete-confirm-actions">
              <button
                className="btn btn-danger"
                type="button"
                disabled={deleting}
                onClick={() => {
                  void handleDeleteWorkshop();
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="spin" /> Excluindo...
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setDeleteConfirm(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        <div className="card card-gap-bottom">
          <div className="card-body">
            {editError && <div className="alert alert-error">{editError}</div>}
            <form
              className="form-grid"
              onSubmit={(event) => {
                void handleUpdate(event);
              }}
            >
              <label className="form-field">
                <span>Nome</span>
                <input
                  className="input"
                  value={editForm.name ?? ''}
                  onChange={(event) => {
                    setEditForm({ ...editForm, name: event.target.value });
                  }}
                />
              </label>
              <label className="form-field">
                <span>CNPJ / CPF</span>
                <input
                  className="input"
                  value={editForm.document ?? ''}
                  onChange={(event) => {
                    setEditForm({ ...editForm, document: event.target.value });
                  }}
                />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input
                  className="input"
                  value={editForm.phone ?? ''}
                  onChange={(event) => {
                    setEditForm({ ...editForm, phone: event.target.value });
                  }}
                />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={editForm.email ?? ''}
                  onChange={(event) => {
                    setEditForm({ ...editForm, email: event.target.value });
                  }}
                />
              </label>
              <label className="form-field full-width">
                <span>Endereço</span>
                <input
                  className="input"
                  value={editForm.address ?? ''}
                  onChange={(event) => {
                    setEditForm({ ...editForm, address: event.target.value });
                  }}
                />
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={editSaving}>
                  {editSaving ? (
                    <>
                      <Loader2 size={16} className="spin" /> Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card card-gap-bottom">
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">CNPJ / CPF</span>
                <span className="detail-value">{workshop.document}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Telefone</span>
                <span className="detail-value">{workshop.phone ?? '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{workshop.email ?? '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Endereço</span>
                <span className="detail-value">{workshop.address ?? '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Criada em</span>
                <span className="detail-value">
                  {new Date(workshop.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-row">
        <h2 className="section-title">Usuários ({users.length})</h2>
        <button
          className={showUserForm ? 'btn btn-secondary' : 'btn btn-primary'}
          type="button"
          onClick={() => {
            setShowUserForm(!showUserForm);
          }}
        >
          {showUserForm ? (
            <>
              <XCircle size={16} /> Cancelar
            </>
          ) : (
            <>
              <Plus size={16} /> Novo Usuário
            </>
          )}
        </button>
      </div>

      {showUserForm && (
        <div className="card card-gap-bottom">
          <div className="card-body">
            {userFormError && <div className="alert alert-error">{userFormError}</div>}
            <form
              className="form-grid"
              onSubmit={(event) => {
                void handleCreateUser(event);
              }}
            >
              <label className="form-field">
                <span>Nome *</span>
                <input
                  className="input"
                  value={userForm.name}
                  onChange={(event) => {
                    setUserForm({ ...userForm, name: event.target.value });
                  }}
                  required
                />
              </label>
              <label className="form-field">
                <span>Email *</span>
                <input
                  className="input"
                  type="email"
                  value={userForm.email}
                  onChange={(event) => {
                    setUserForm({ ...userForm, email: event.target.value });
                  }}
                  required
                />
              </label>
              <label className="form-field">
                <span>Senha *</span>
                <input
                  className="input"
                  type="password"
                  value={userForm.password}
                  onChange={(event) => {
                    setUserForm({ ...userForm, password: event.target.value });
                  }}
                  required
                  minLength={6}
                />
              </label>
              <label className="form-field">
                <span>Papel</span>
                <select
                  className="input"
                  value={userForm.role}
                  onChange={(event) => {
                    setUserForm({
                      ...userForm,
                      role: event.target.value as 'WORKSHOP_OWNER' | 'MECHANIC',
                    });
                  }}
                >
                  <option value="WORKSHOP_OWNER">Dono da Oficina</option>
                  <option value="MECHANIC">Mecânico</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={userSaving}>
                  {userSaving ? (
                    <>
                      <Loader2 size={16} className="spin" /> Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Criado em</th>
              <th className="th-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editingUserId === user.id ? (
                <tr key={user.id}>
                  <td colSpan={5}>
                    <form
                      className="inline-edit-form"
                      onSubmit={(event) => {
                        void handleUpdateUser(event);
                      }}
                    >
                      {editUserError && (
                        <div className="alert alert-error">{editUserError}</div>
                      )}
                      <div className="inline-edit-fields">
                        <input
                          className="input"
                          placeholder="Nome"
                          value={editUserForm.name ?? ''}
                          onChange={(event) => {
                            setEditUserForm({ ...editUserForm, name: event.target.value });
                          }}
                        />
                        <input
                          className="input"
                          type="email"
                          placeholder="Email"
                          value={editUserForm.email ?? ''}
                          onChange={(event) => {
                            setEditUserForm({ ...editUserForm, email: event.target.value });
                          }}
                        />
                        <select
                          className="input"
                          value={editUserForm.role ?? 'WORKSHOP_OWNER'}
                          onChange={(event) => {
                            setEditUserForm({
                              ...editUserForm,
                              role: event.target.value as 'WORKSHOP_OWNER' | 'MECHANIC',
                            });
                          }}
                        >
                          <option value="WORKSHOP_OWNER">Dono da Oficina</option>
                          <option value="MECHANIC">Mecânico</option>
                        </select>
                        <div className="table-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            type="submit"
                            disabled={editUserSaving}
                          >
                            {editUserSaving ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              'Salvar'
                            )}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            type="button"
                            onClick={() => {
                              setEditingUserId(null);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td className="td-bold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="td-center">
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        type="button"
                        title="Editar usuário"
                        onClick={() => {
                          startEditUser(user);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        type="button"
                        title="Excluir usuário"
                        disabled={deletingUserId === user.id}
                        onClick={() => {
                          if (
                            globalThis.confirm(
                              `Excluir o usuário ${user.name}? Esta ação é irreversível.`,
                            )
                          ) {
                            void handleDeleteUser(user.id);
                          }
                        }}
                      >
                        {deletingUserId === user.id ? (
                          <Loader2 size={16} className="spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="td-empty">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
