import { useState } from 'react';
import { createServiceOrder } from './services/api';

export function App() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleCreateOrder(): Promise<void> {
    setLoading(true);
    try {
      const result = await createServiceOrder({
        workshopId: 'workshop-001',
        customerId: 'customer-001',
        vehicleId: 'vehicle-001',
        description: 'Troca de óleo e filtros',
        items: [
          { description: 'Óleo 5W30', quantity: 4, unitPrice: 3500 },
          { description: 'Filtro de óleo', quantity: 1, unitPrice: 4500 },
        ],
      });
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Erro: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 40 }}
    >
      <h1 style={{ color: '#1a1a2e' }}>🚗 TorqueHub</h1>
      <h2 style={{ color: '#16213e' }}>Portal do Cliente</h2>
      <p style={{ color: '#666' }}>Plataforma de gestão de manutenção automotiva.</p>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h3>Testar API - Criar Ordem de Serviço</h3>
      <button
        onClick={handleCreateOrder}
        disabled={loading}
        style={{
          background: '#1a1a2e',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 16,
        }}
      >
        {loading ? 'Enviando...' : 'POST /service-orders'}
      </button>

      {response && (
        <pre
          style={{
            marginTop: 20,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 14,
          }}
        >
          {response}
        </pre>
      )}
    </div>
  );
}
