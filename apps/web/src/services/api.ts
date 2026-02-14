const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3333';

interface CreateServiceOrderInput {
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

export async function createServiceOrder(input: CreateServiceOrderInput): Promise<unknown> {
  const response = await fetch(`${API_URL}/service-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
