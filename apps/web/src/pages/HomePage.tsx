/**
 * HomePage — Token search page where clients enter their order code.
 * Acts as a landing page when no token is in the URL.
 * @module HomePage
 */

import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Search } from '../components/icons';

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
          <h2 className="search-heading">Consultar Ordem de Serviço</h2>
          <p className="search-description">
            Insira o código que você recebeu da oficina para acompanhar o status do seu serviço.
          </p>
          <form onSubmit={handleSubmit} className="search-form">
            <input
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
              }}
              placeholder="Código da ordem..."
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={!token.trim()}>
              <Search size={16} /> Consultar
            </button>
          </form>
        </div>
      </div>

      {/* Welcome placeholder */}
      <div className="welcome-section">
        <span className="welcome-emoji"><Car size={48} /></span>
        <p className="welcome-text">Bem-vindo ao portal do cliente TorqueHub</p>
        <p className="welcome-subtext">
          Aqui você pode acompanhar o orçamento e o andamento do serviço do seu veículo.
        </p>
      </div>
    </div>
  );
}
