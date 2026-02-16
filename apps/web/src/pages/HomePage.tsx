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
          <h2 style={{ marginBottom: 8, fontSize: 18, color: 'var(--color-text)' }}>
            Consultar Ordem de Serviço
          </h2>
          <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Insira o código que você recebeu da oficina para acompanhar o status do seu serviço.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
              }}
              placeholder="Código da ordem..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={!token.trim()}>
              Consultar
            </button>
          </form>
        </div>
      </div>

      {/* Welcome placeholder */}
      <div style={{ textAlign: 'center', marginTop: 48, color: 'var(--color-muted)' }}>
        <span style={{ fontSize: 64 }}>🚗</span>
        <p style={{ fontSize: 16, marginTop: 12 }}>Bem-vindo ao portal do cliente TorqueHub</p>
        <p style={{ fontSize: 14, marginTop: 4 }}>
          Aqui você pode acompanhar o orçamento e o andamento do serviço do seu veículo.
        </p>
      </div>
    </div>
  );
}
