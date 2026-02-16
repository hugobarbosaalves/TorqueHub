/**
 * OrderItems — Table of service order line items with totals.
 * @module OrderItems
 */

import type { ReactNode } from 'react';
import type { ServiceOrderItem } from '../services/api';
import { SectionCard } from './SectionCard';
import { currency } from '../utils/format';

interface OrderItemsProps {
  readonly items: ServiceOrderItem[];
  readonly totalAmount: number;
}

/** Renders the items table and total amount. */
export function OrderItems({ items, totalAmount }: OrderItemsProps): ReactNode {
  return (
    <SectionCard icon="📋" title="Itens do Serviço">

        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                borderBottom: '2px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                textAlign: 'left',
              }}
            >
              <th style={{ padding: '8px 0', fontWeight: 600 }}>Descrição</th>
              <th style={{ padding: '8px 0', fontWeight: 600, width: 50, textAlign: 'center' }}>
                Qtd
              </th>
              <th style={{ padding: '8px 0', fontWeight: 600, width: 100, textAlign: 'right' }}>
                Unit.
              </th>
              <th style={{ padding: '8px 0', fontWeight: 600, width: 100, textAlign: 'right' }}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px 0' }}>{item.description}</td>
                <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  {currency(item.unitPrice)}
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                  {currency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg)',
            padding: '14px 20px',
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Total
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
            {currency(totalAmount)}
          </span>
        </div>
    </SectionCard>
  );
}
