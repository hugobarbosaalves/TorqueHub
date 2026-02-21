/**
 * Email service — sends transactional emails via SMTP (nodemailer).
 *
 * Configurable via environment variables:
 * - SMTP_HOST: SMTP server host (default: empty → disabled)
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP authentication user
 * - SMTP_PASS: SMTP authentication password
 * - SMTP_FROM: Sender email address (default: noreply@torquehub.com.br)
 * - SMTP_SECURE: Use TLS (default: false)
 *
 * When SMTP_HOST is not configured, emails are logged to console instead of sent.
 * @module email-service
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Configuração SMTP extraída do ambiente. */
interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly pass: string;
  readonly from: string;
  readonly secure: boolean;
}

/** Payload para envio de email. */
interface EmailPayload {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
}

/** Resultado do envio de email. */
interface EmailResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}

/** Lê a configuração SMTP do ambiente. */
function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env['SMTP_HOST'] ?? '',
    port: Number(process.env['SMTP_PORT'] ?? '587'),
    user: process.env['SMTP_USER'] ?? '',
    pass: process.env['SMTP_PASS'] ?? '',
    from: process.env['SMTP_FROM'] ?? 'TorqueHub <noreply@torquehub.com.br>',
    secure: process.env['SMTP_SECURE'] === 'true',
  };
}

/** Verifica se o SMTP está habilitado. */
function isSmtpEnabled(): boolean {
  return getSmtpConfig().host.length > 0;
}

/** Cria o transporter do nodemailer. Lança erro se SMTP não estiver configurado. */
function createTransporter(): Transporter {
  const config = getSmtpConfig();
  if (!config.host) {
    throw new Error('[EMAIL] SMTP_HOST não configurado — impossível criar transporter');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

let transporter: Transporter | null = null;

/** Returns (and lazily creates) the SMTP transporter singleton. */
function getOrCreateTransporter(): Transporter {
  const transport = transporter ?? createTransporter();
  transporter = transport;
  return transport;
}

/**
 * Envia um email transacional.
 *
 * Se SMTP não estiver configurado, loga o email no console (dev mode).
 * @param payload - Dados do email (to, subject, html, text)
 * @returns Resultado do envio
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const config = getSmtpConfig();

  if (!isSmtpEnabled()) {
    /* eslint-disable no-console -- Dev-mode: log simulated emails when SMTP is not configured */
    console.log('[EMAIL] SMTP não configurado — email simulado:');
    console.log(`  To: ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    console.log(`  Body: ${payload.text ?? payload.html.substring(0, 200)}`);
    /* eslint-enable no-console */
    return { success: true, messageId: 'dev-simulated' };
  }

  try {
    const transport = getOrCreateTransporter();

    const info = await transport.sendMail({
      from: config.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console -- Logging email send failures is intentional
    console.error(`[EMAIL] Erro ao enviar para ${payload.to}: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Envia email de convite para um novo usuário criado pelo admin.
 *
 * @param to - Email do destinatário
 * @param name - Nome do usuário
 * @param temporaryPassword - Senha temporária gerada
 * @param workshopName - Nome da oficina
 * @param role - Role atribuído
 */
export async function sendInviteEmail(
  to: string,
  name: string,
  temporaryPassword: string,
  workshopName: string,
  role: string,
): Promise<EmailResult> {
  const roleLabel = role === 'WORKSHOP_OWNER' ? 'Dono da Oficina' : 'Mecânico';
  const appUrl = process.env['APP_URL'] ?? 'https://torquehub.com.br';

  const subject = `Bem-vindo ao TorqueHub — Convite para ${workshopName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A56DB; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🔧 TorqueHub</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1F2937;">Olá, ${name}!</h2>
        <p style="color: #4B5563;">Você foi convidado(a) para a oficina <strong>${workshopName}</strong> como <strong>${roleLabel}</strong>.</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #374151;"><strong>Seus dados de acesso:</strong></p>
          <p style="margin: 8px 0 0; color: #374151;">Email: <code>${to}</code></p>
          <p style="margin: 4px 0 0; color: #374151;">Senha temporária: <code>${temporaryPassword}</code></p>
        </div>
        <p style="color: #EF4444; font-size: 14px;">⚠️ Troque sua senha no primeiro acesso.</p>
        <a href="${appUrl}/login" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">Acessar TorqueHub</a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px;">Este email foi enviado automaticamente pelo TorqueHub. Se você não esperava este convite, ignore esta mensagem.</p>
      </div>
    </div>
  `;

  const text = `Olá ${name}!\n\nVocê foi convidado(a) para a oficina "${workshopName}" como ${roleLabel}.\n\nSeus dados de acesso:\nEmail: ${to}\nSenha temporária: ${temporaryPassword}\n\n⚠️ Troque sua senha no primeiro acesso.\n\nAcesse: ${appUrl}/login`;

  return sendEmail({ to, subject, html, text });
}
