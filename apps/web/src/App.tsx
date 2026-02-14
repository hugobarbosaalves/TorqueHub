import { useState } from 'react';
import { getOrderByToken, type ServiceOrder } from './services/api';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  DRAFT: { label: 'Rascunho', color: '#94a3b8', icon: '📝' },
  PENDING_APPROVAL: { label: 'Aguardando Sua Aprovação', color: '#f59e0b', icon: '⏳' },
  APPROVED: { label: 'Aprovada', color: '#3b82f6', icon: '👍' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#8b5cf6', icon: '🔧' },
  COMPLETED: { label: 'Serviço Concluído', color: '#22c55e', icon: '✅' },
  CANCELLED: { label: 'Cancelada', color: '#ef4444', icon: '❌' },
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function App() {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verifica se há token na URL (?token=xxx)
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      fetchOrder(urlToken);
    }
  });

  async function fetchOrder(t: string): Promise<void> {
    if (!t.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await getOrderByToken(t.trim());
      setOrder(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ordem não encontrada');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    fetchOrder(token);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '24px 32px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>🔧 TorqueHub</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, opacity: 0.8 }}>
          Portal do Cliente — Acompanhe seu serviço
        </p>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
        {/* Search by token */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: 18, color: '#1e293b' }}>
            Consultar Ordem de Serviço
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
            Insira o código que você recebeu da oficina para acompanhar o status do seu serviço.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Código da ordem de serviço..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !token.trim()}
              style={{
                background: loading ? '#94a3b8' : '#1a1a2e',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 15 }}>
              😕 {error}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#9ca3af' }}>
              Verifique o código e tente novamente.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Status Banner */}
            {(() => {
              const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#94a3b8', icon: '❓' };
              return (
                <div
                  style={{
                    background: statusInfo.color,
                    color: '#fff',
                    padding: '16px 24px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{statusInfo.icon}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>
                    {statusInfo.label}
                  </h3>
                </div>
              );
            })()}

            <div style={{ padding: 24 }}>
              {/* Description */}
              <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b' }}>
                {order.description}
              </h3>

              {order.observations && (
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
                  {order.observations}
                </p>
              )}

              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                Criada em: {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>

              {/* Items Table */}
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Serviço / Peça</th>
                    <th style={{ padding: '8px 0', fontWeight: 600, width: 60, textAlign: 'center' }}>Qtd</th>
                    <th style={{ padding: '8px 0', fontWeight: 600, width: 110, textAlign: 'right' }}>Unitário</th>
                    <th style={{ padding: '8px 0', fontWeight: 600, width: 110, textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 0' }}>{item.description}</td>
                      <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '16px 20px',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        {!order && !error && !loading && (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8' }}>
            <span style={{ fontSize: 64 }}>🚗</span>
            <p style={{ fontSize: 16, marginTop: 12 }}>
              Bem-vindo ao portal do cliente TorqueHub
            </p>
            <p style={{ fontSize: 14 }}>
              Aqui você pode acompanhar o orçamento e o andamento do serviço do seu veículo.
            </p>
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '24px 16px', color: '#94a3b8', fontSize: 12 }}>
        TorqueHub — Gestão de Manutenção Automotiva
      </footer>
    </div>
  );
}
