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
import { Frown, Search } from '../components/icons';

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
      <div className="container loading-center">
        <div className="spinner" />
        <p className="loading-text">Carregando sua ordem...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <div className="card card-border-danger">
          <div className="card-body error-card-body">
            <span className="order-hero-emoji"><Frown size={48} /></span>
            <p className="order-error-title">{error || 'Ordem não encontrada'}</p>
            <p className="order-error-hint">Verifique o link e tente novamente.</p>
            <Link to="/" className="btn btn-primary order-error-link">
              <Search size={16} /> Buscar pelo código
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container order-container">
      {/* Status Banner */}
      <div className="card order-status-card">
        <StatusBanner status={order.status} />
        <div className="card-body">
          <h2 className="order-description">{order.description}</h2>
          {order.observations && <p className="order-observations">{order.observations}</p>}
          <p className="order-date">Criada em {formatDateLong(order.createdAt)}</p>
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
