/**
 * Admin WorkshopDetailPage — view/edit a workshop and manage its users.
 * @module AdminWorkshopDetailPage
 */

import { type ReactNode, useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
  WorkshopDTO,
  UserDTO,
  CreateWorkshopUserRequest,
  UpdateWorkshopRequest,
} from '@torquehub/contracts';
import {
  getWorkshop,
  updateWorkshop,
  listWorkshopUsers,
  createWorkshopUser,
} from '../../services/adminService';
import { ArrowLeft, Pencil, XCircle, Plus, Loader2 } from '../../components/icons';

/** Maps role to display label. */
function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    PLATFORM_ADMIN: 'Admin Plataforma',
    WORKSHOP_OWNER: 'Dono da Oficina',
    MECHANIC: 'Mecânico',
  };
  return labels[role] ?? role;
}

/** Workshop detail page with user management. */
export function WorkshopDetailPage(): ReactNode {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workshop, setWorkshop] = useState<WorkshopDTO | null>(null);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Edit form state. */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateWorkshopRequest>({});
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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
        <button
          className={editing ? 'btn btn-secondary' : 'btn btn-outline'}
          type="button"
          onClick={() => {
            setEditing(!editing);
          }}
        >
          {editing ? <><XCircle size={16} /> Cancelar</> : <><Pencil size={16} /> Editar</>}
        </button>
      </div>

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
                  {editSaving ? <><Loader2 size={16} className="spin" /> Salvando...</> : 'Salvar'}
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
          {showUserForm ? <><XCircle size={16} /> Cancelar</> : <><Plus size={16} /> Novo Usuário</>}
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
                  {userSaving ? <><Loader2 size={16} className="spin" /> Criando...</> : 'Criar Usuário'}
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
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="td-bold">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="td-empty">
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
