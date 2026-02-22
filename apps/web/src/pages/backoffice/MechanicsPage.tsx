/**
 * Backoffice MechanicsPage — manage workshop team (mechanics).
 * @module BackofficeMechanicsPage
 */

import { type ReactNode, useEffect, useState, type FormEvent } from 'react';
import type { UserDTO, CreateWorkshopUserRequest } from '@torquehub/contracts';
import { getUser } from '../../services/authService';
import { createWorkshopUser, listWorkshopUsers } from '../../services/adminService';

/** Maps role to display label. */
function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    PLATFORM_ADMIN: 'Admin',
    WORKSHOP_OWNER: 'Dono',
    MECHANIC: 'Mecânico',
  };
  return labels[role] ?? role;
}

/** Mechanics team management page. */
export function MechanicsPage(): ReactNode {
  const currentUser = getUser();
  const workshopId = currentUser?.workshopId ?? '';

  const [team, setTeam] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  /** Form state for adding a mechanic. */
  const [form, setForm] = useState<CreateWorkshopUserRequest>({
    name: '',
    email: '',
    password: '',
    role: 'MECHANIC',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workshopId) return;
    void loadTeam();
  }, [workshopId]);

  /** Loads workshop team. */
  async function loadTeam(): Promise<void> {
    setLoading(true);
    try {
      const data = await listWorkshopUsers(workshopId);
      setTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe');
    } finally {
      setLoading(false);
    }
  }

  /** Handles new mechanic creation. */
  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await createWorkshopUser(workshopId, form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'MECHANIC' });
      await loadTeam();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar mecânico');
    } finally {
      setSaving(false);
    }
  }

  if (!workshopId) return <div className="page-error">Workshop não identificado</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Equipe</h1>
          <p className="page-subtitle">{team.length} membros</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : '+ Novo Mecânico'}
        </button>
      </div>

      {showForm && (
        <div className="card card-gap-bottom">
          <div className="card-body">
            <h2 className="section-title">Novo Mecânico</h2>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form
              className="form-grid"
              onSubmit={(event) => {
                void handleCreate(event);
              }}
            >
              <label className="form-field">
                <span>Nome *</span>
                <input
                  className="input"
                  value={form.name}
                  onChange={(event) => {
                    setForm({ ...form, name: event.target.value });
                  }}
                  required
                />
              </label>
              <label className="form-field">
                <span>Email *</span>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => {
                    setForm({ ...form, email: event.target.value });
                  }}
                  required
                />
              </label>
              <label className="form-field">
                <span>Senha *</span>
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(event) => {
                    setForm({ ...form, password: event.target.value });
                  }}
                  required
                  minLength={6}
                />
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Criando...' : 'Criar Mecânico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
                <th>Desde</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td className="td-bold">{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`role-badge role-${String(member.role).toLowerCase()}`}>
                      {roleLabel(member.role)}
                    </span>
                  </td>
                  <td>{new Date(member.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {team.length === 0 && (
                <tr>
                  <td colSpan={4} className="td-empty">
                    Nenhum membro na equipe
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
