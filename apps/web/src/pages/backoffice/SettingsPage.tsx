/**
 * Backoffice SettingsPage — workshop settings and password change.
 * @module BackofficeSettingsPage
 */

import { useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { getUser, changePassword } from '../../services/authService';
import { Loader2 } from '../../components/icons';

/** Workshop settings page with profile and password change. */
export function SettingsPage(): ReactNode {
  const user = getUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  /** Submete a troca de senha. */
  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Configurações</h1>
      <p className="page-subtitle">Configurações da oficina e perfil do usuário</p>

      <div className="card">
        <div className="card-body">
          <h2 className="section-title">Meu Perfil</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Nome</span>
              <span className="detail-value">{user?.name ?? '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email ?? '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Papel</span>
              <span className="detail-value">Dono da Oficina</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="section-title">Alterar Senha</h2>

          {message && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">
                Senha atual
              </label>
              <input
                id="currentPassword"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={16} className="spin" /> Alterando...</> : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
