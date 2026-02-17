/**
 * OrderPage — Public order detail page accessed via shared link.
 * Shows status, vehicle info, items, media gallery, and vehicle history.
 * @module OrderPage
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByToken, getQuotePdfUrl, type PublicOrderDetail } from '../services/api';
import { StatusBanner } from '../components/StatusBanner';
import { VehicleInfo } from '../components/VehicleInfo';
import { OrderItems } from '../components/OrderItems';
import { MediaGallery } from '../components/MediaGallery';
import { VehicleHistory } from '../components/VehicleHistory';
import { QuoteDownload } from '../components/QuoteDownload';
import { formatDateLong } from '../utils/format';

/** Renders the full order detail page for the public client portal. */
export function OrderPage(): ReactNode {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<PublicOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    getOrderByToken(token)
      .then(setOrder)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Ordem não encontrada');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>Carregando sua ordem...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 48 }}>😕</span>
            <p
              style={{ fontSize: 16, fontWeight: 600, marginTop: 12, color: 'var(--color-danger)' }}
            >
              {error || 'Ordem não encontrada'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 8 }}>
              Verifique o link e tente novamente.
            </p>
            <Link
              to="/"
              className="btn btn-primary"
              style={{ marginTop: 16, display: 'inline-flex' }}
            >
              Buscar pelo código
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 0 }}>
      {/* Status Banner */}
      <div className="card" style={{ marginBottom: 20 }}>
        <StatusBanner status={order.status} />
        <div className="card-body">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{order.description}</h2>
          {order.observations && (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              {order.observations}
            </p>
          )}
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
            Criada em {formatDateLong(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Vehicle + Customer */}
      <VehicleInfo vehicle={order.vehicle} customerName={order.customerName} />

      {/* Items + Total */}
      <OrderItems items={order.items} totalAmount={order.totalAmount} />

      {/* Media Gallery */}
      <MediaGallery media={order.media} />

      {/* Download PDF */}
      {token && <QuoteDownload pdfUrl={getQuotePdfUrl(token)} />}

      {/* Vehicle Service History */}
      {token && <VehicleHistory token={token} currentOrderId={order.id} />}
    </div>
  );
}
