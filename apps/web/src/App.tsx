import { useCallback, useEffect, useState } from 'react';
import {
  getWorkshops,
  getCustomers,
  getVehicles,
  getServiceOrders,
  createServiceOrder,
  updateOrderStatus,
  deleteServiceOrder,
  type Workshop,
  type Customer,
  type Vehicle,
  type ServiceOrder,
} from './services/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: '#94a3b8' },
  PENDING_APPROVAL: { label: 'Aguardando Aprovação', color: '#f59e0b' },
  APPROVED: { label: 'Aprovada', color: '#3b82f6' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#8b5cf6' },
  COMPLETED: { label: 'Concluída', color: '#22c55e' },
  CANCELLED: { label: 'Cancelada', color: '#ef4444' },
};

const STATUS_FLOW = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function App() {
  // ── State ───────────────────────────────────────────────────────────────
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const [description, setDescription] = useState('');
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Load workshops on mount ─────────────────────────────────────────────
  useEffect(() => {
    getWorkshops().then(setWorkshops).catch((e) => setError(e.message));
  }, []);

  // ── Load customers when workshop changes ────────────────────────────────
  useEffect(() => {
    if (!selectedWorkshop) {
      setCustomers([]);
      setSelectedCustomer('');
      return;
    }
    getCustomers(selectedWorkshop).then(setCustomers).catch((e) => setError(e.message));
  }, [selectedWorkshop]);

  // ── Load vehicles when customer changes ─────────────────────────────────
  useEffect(() => {
    if (!selectedWorkshop || !selectedCustomer) {
      setVehicles([]);
      setSelectedVehicle('');
      return;
    }
    getVehicles(selectedWorkshop, selectedCustomer).then(setVehicles).catch((e) => setError(e.message));
  }, [selectedWorkshop, selectedCustomer]);

  // ── Load orders ─────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      const data = await getServiceOrders(selectedWorkshop || undefined);
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar ordens');
    }
  }, [selectedWorkshop]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const validItems = items
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Math.round(Number(i.unitPrice) * 100), // BRL → cents
        }));

      if (validItems.length === 0) {
        setError('Adicione pelo menos 1 item');
        return;
      }

      await createServiceOrder({
        workshopId: selectedWorkshop,
        customerId: selectedCustomer,
        vehicleId: selectedVehicle,
        description,
        items: validItems,
      });

      setSuccess('Ordem de serviço criada com sucesso!');
      setDescription('');
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar ordem');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (order: ServiceOrder) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1]!;
    try {
      await updateOrderStatus(order.id, nextStatus);
      setSuccess(`Status atualizado para: ${STATUS_LABELS[nextStatus]?.label}`);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const handleCancel = async (order: ServiceOrder) => {
    if (!confirm('Tem certeza que deseja cancelar esta ordem?')) return;
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      setSuccess('Ordem cancelada');
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao cancelar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR esta ordem? Esta ação não pode ser desfeita.'))
      return;
    try {
      await deleteServiceOrder(id);
      setSuccess('Ordem excluída');
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 32 }}>🔧</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>TorqueHub</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
            Gestão de Manutenção Automotiva
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* Alerts */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>❌ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}
        {success && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#16a34a',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          {/* ── Left Panel: Create Order Form ────────────────────────────── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>
              ➕ Nova Ordem de Serviço
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Workshop */}
              <label style={labelStyle}>Oficina</label>
              <select
                value={selectedWorkshop}
                onChange={(e) => setSelectedWorkshop(e.target.value)}
                style={selectStyle}
                required
              >
                <option value="">Selecione a oficina...</option>
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* Customer */}
              <label style={labelStyle}>Cliente</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                style={selectStyle}
                required
                disabled={!selectedWorkshop}
              >
                <option value="">
                  {selectedWorkshop ? 'Selecione o cliente...' : 'Selecione uma oficina primeiro'}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.document ? `(${c.document})` : ''}
                  </option>
                ))}
              </select>

              {/* Vehicle */}
              <label style={labelStyle}>Veículo</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                style={selectStyle}
                required
                disabled={!selectedCustomer}
              >
                <option value="">
                  {selectedCustomer ? 'Selecione o veículo...' : 'Selecione um cliente primeiro'}
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} — {v.plate}
                  </option>
                ))}
              </select>

              {/* Description */}
              <label style={labelStyle}>Descrição do Serviço</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                placeholder="Ex: Troca de óleo e filtros"
                required
              />

              {/* Items */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <label style={{ ...labelStyle, margin: 0 }}>Itens / Serviços</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  + Adicionar Item
                </button>
              </div>

              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '10px 12px',
                    marginTop: 8,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Item {i + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    value={item.description}
                    onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                    style={{ ...inputStyle, marginTop: 4 }}
                    placeholder="Descrição do item"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Qtd</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                        style={inputStyle}
                        min={1}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Valor (R$)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(i, 'unitPrice', e.target.value)}
                        style={inputStyle}
                        min={0}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading || !selectedWorkshop || !selectedCustomer || !selectedVehicle}
                style={{
                  width: '100%',
                  marginTop: 20,
                  background: loading ? '#94a3b8' : '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {loading ? 'Criando...' : 'Criar Ordem de Serviço'}
              </button>
            </form>
          </div>

          {/* ── Right Panel: Orders List ──────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>
                📋 Ordens de Serviço ({orders.length})
              </h2>
              <button
                onClick={loadOrders}
                style={{
                  background: '#e0f2fe',
                  color: '#0284c7',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                🔄 Atualizar
              </button>
            </div>

            {orders.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 40,
                  textAlign: 'center',
                  color: '#94a3b8',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>Nenhuma ordem de serviço encontrada.</p>
                <p style={{ fontSize: 14 }}>Use o formulário ao lado para criar uma nova.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#94a3b8' };
                  const canAdvance =
                    STATUS_FLOW.includes(order.status) &&
                    STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
                  const canCancel = order.status !== 'CANCELLED' && order.status !== 'COMPLETED';

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${statusInfo.color}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#1e293b' }}>
                            {order.description}
                          </h3>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            ID: {order.id.slice(0, 8)}... | Token: {order.publicToken.slice(0, 8)}...
                          </p>
                        </div>
                        <span
                          style={{
                            background: statusInfo.color + '20',
                            color: statusInfo.color,
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div style={{ marginTop: 12 }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ color: '#64748b', textAlign: 'left' }}>
                              <th style={{ padding: '4px 0', fontWeight: 500 }}>Item</th>
                              <th style={{ padding: '4px 0', fontWeight: 500, width: 50, textAlign: 'center' }}>
                                Qtd
                              </th>
                              <th style={{ padding: '4px 0', fontWeight: 500, width: 100, textAlign: 'right' }}>
                                Unit.
                              </th>
                              <th style={{ padding: '4px 0', fontWeight: 500, width: 100, textAlign: 'right' }}>
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 0' }}>{item.description}</td>
                                <td style={{ padding: '6px 0', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '6px 0', textAlign: 'right' }}>
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>
                                  {formatCurrency(item.totalPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                              <td colSpan={3} style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>
                                Total:
                              </td>
                              <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: '#1a1a2e' }}>
                                {formatCurrency(order.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        {canAdvance && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 14px',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            ▶ Avançar Status
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order)}
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fca5a5',
                              borderRadius: 6,
                              padding: '6px 14px',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            ✕ Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(order.id)}
                          style={{
                            background: 'none',
                            color: '#94a3b8',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: 12,
                            marginLeft: 'auto',
                          }}
                        >
                          🗑 Excluir
                        </button>
                      </div>

                      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        Criada em: {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared Styles ───────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
  marginTop: 12,
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#fff',
};
