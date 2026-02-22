/**
 * OrderItems — Table of service order line items with totals.
 * @module OrderItems
 */

import type { ReactNode } from 'react';
import type { ServiceOrderItem } from '../services/api';
import { SectionCard } from './SectionCard';
import { currency } from '../utils/format';
import { ClipboardList } from './icons';

interface OrderItemsProps {
  readonly items: ServiceOrderItem[];
  readonly totalAmount: number;
}

/** Renders the items table and total amount. */
export function OrderItems({ items, totalAmount }: OrderItemsProps): ReactNode {
  return (
    <SectionCard icon={<ClipboardList size={20} />} title="Itens do Serviço">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="th-center">Qtd</th>
              <th className="th-right">Unit.</th>
              <th className="th-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="td-center">{item.quantity}</td>
                <td className="td-right">{currency(item.unitPrice)}</td>
                <td className="td-right td-bold">{currency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-total-bar">
        <span className="order-total-label">Total</span>
        <span className="order-total-value">{currency(totalAmount)}</span>
      </div>
    </SectionCard>
  );
}
