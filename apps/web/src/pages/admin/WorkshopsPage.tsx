/**
 * Admin WorkshopsPage — list and create workshops.
 * @module AdminWorkshopsPage
 */

import { type ReactNode, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkshopDTO, CreateWorkshopRequest } from '@torquehub/contracts';
import { listWorkshops, createWorkshop } from '../../services/adminService';

/** Workshops listing + creation page. */
export function WorkshopsPage(): ReactNode {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<WorkshopDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  /** Form state for creating a new workshop. */
  const [form, setForm] = useState<CreateWorkshopRequest>({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadWorkshops();
  }, []);

  /** Loads the workshop list. */
  async function loadWorkshops(): Promise<void> {
    setLoading(true);
    try {
      const data = await listWorkshops();
      setWorkshops(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar oficinas');
    } finally {
      setLoading(false);
    }
  }

  /** Handles new workshop form submission. */
  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      await createWorkshop(form);
      setShowForm(false);
      setForm({ name: '', document: '', phone: '', email: '', address: '' });
      await loadWorkshops();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar oficina');
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Oficinas</h1>
          <p className="page-subtitle">{workshops.length} oficinas cadastradas</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : '+ Nova Oficina'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-10)' }}>
          <div className="card-body">
            <h2 className="section-title">Nova Oficina</h2>
            {formError && <div className="login-error">{formError}</div>}
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
                <span>CNPJ / CPF *</span>
                <input
                  className="input"
                  value={form.document}
                  onChange={(event) => {
                    setForm({ ...form, document: event.target.value });
                  }}
                  required
                />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(event) => {
                    setForm({ ...form, phone: event.target.value });
                  }}
                />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => {
                    setForm({ ...form, email: event.target.value });
                  }}
                />
              </label>
              <label className="form-field full-width">
                <span>Endereço</span>
                <input
                  className="input"
                  value={form.address}
                  onChange={(event) => {
                    setForm({ ...form, address: event.target.value });
                  }}
                />
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Criar Oficina'}
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
                <th>CNPJ / CPF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((workshop) => (
                <tr
                  key={workshop.id}
                  className="table-row-clickable"
                  onClick={() => {
                    navigate(`/admin/workshops/${workshop.id}`);
                  }}
                >
                  <td className="td-bold">{workshop.name}</td>
                  <td>{workshop.document}</td>
                  <td>{workshop.phone ?? '—'}</td>
                  <td>{workshop.email ?? '—'}</td>
                  <td>{new Date(workshop.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {workshops.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-empty">
                    Nenhuma oficina cadastrada
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
