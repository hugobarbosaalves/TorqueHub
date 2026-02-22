/**
 * Backoffice CustomersPage — list and manage customers.
 * @module BackofficeCustomersPage
 */

import { type ReactNode, useEffect, useState, type FormEvent } from 'react';
import type { CustomerDTO } from '@torquehub/contracts';
import { listCustomers, createCustomer, deleteCustomer } from '../../services/backofficeService';
import { Plus, XCircle, Loader2, Trash2 } from '../../components/icons';

/** Customers listing + creation page. */
export function CustomersPage(): ReactNode {
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  /** Form state. */
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadCustomers();
  }, []);

  /** Loads customer list. */
  async function loadCustomers(): Promise<void> {
    setLoading(true);
    try {
      const data = await listCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  /** Handles new customer creation. */
  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await createCustomer(form);
      setShowForm(false);
      setForm({ name: '', document: '', phone: '', email: '' });
      await loadCustomers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setSaving(false);
    }
  }

  /** Handles customer deletion with confirmation. */
  async function handleDelete(customer: CustomerDTO): Promise<void> {
    if (!globalThis.confirm(`Excluir cliente "${customer.name}"?`)) return;
    try {
      await deleteCustomer(customer.id);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{customers.length} clientes</p>
        </div>
        <button
          className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}
          type="button"
          onClick={() => {
            setShowForm(!showForm);
          }}
        >
          {showForm ? <><XCircle size={16} /> Cancelar</> : <><Plus size={16} /> Novo Cliente</>}
        </button>
      </div>

      {showForm && (
        <div className="card card-gap-bottom">
          <div className="card-body">
            <h2 className="section-title">Novo Cliente</h2>
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
                <span>CPF</span>
                <input
                  className="input"
                  value={form.document}
                  onChange={(event) => {
                    setForm({ ...form, document: event.target.value });
                  }}
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
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> Salvando...</> : 'Criar Cliente'}
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
                <th>CPF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="td-bold">{customer.name}</td>
                  <td>{customer.document ?? '—'}</td>
                  <td>{customer.phone ?? '—'}</td>
                  <td>{customer.email ?? '—'}</td>
                  <td>
                    <button
                      className="btn-danger-small"
                      type="button"
                      onClick={() => {
                        void handleDelete(customer);
                      }}
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-empty">
                    Nenhum cliente cadastrado
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
