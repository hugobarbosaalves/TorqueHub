/**
 * HomePage — Token search page where clients enter their order code.
 * Acts as a landing page when no token is in the URL.
 * @module HomePage
 */

import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/** Renders the token search form for the client portal landing page. */
export function HomePage(): ReactNode {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = token.trim();
    if (trimmed) void navigate(`/order/${trimmed}`);
  };

  return (
    <div className="container">
      {/* Search card */}
      <div className="card">
        <div className="card-body">
          <h2
            style={{
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text)',
            }}
          >
            Consultar Ordem de Serviço
          </h2>
          <p
            style={{
              marginBottom: 'var(--space-8)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Insira o código que você recebeu da oficina para acompanhar o status do seu serviço.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <input
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
              }}
              placeholder="Código da ordem..."
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={!token.trim()}>
              Consultar
            </button>
          </form>
        </div>
      </div>

      {/* Welcome placeholder */}
      <div
        style={{ textAlign: 'center', marginTop: 'var(--space-20)', color: 'var(--color-muted)' }}
      >
        <span style={{ fontSize: 64 }}>🚗</span>
        <p style={{ fontSize: 'var(--font-size-md)', marginTop: 'var(--space-6)' }}>
          Bem-vindo ao portal do cliente TorqueHub
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
          Aqui você pode acompanhar o orçamento e o andamento do serviço do seu veículo.
        </p>
      </div>
    </div>
  );
}
