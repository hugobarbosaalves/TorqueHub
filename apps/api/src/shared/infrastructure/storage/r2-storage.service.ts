/**
 * Cloudflare R2 storage service — upload, delete e URL pública.
 * Compatível com S3 API. Fallback para filesystem local em dev.
 * @module r2-storage-service
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env['R2_ACCOUNT_ID'] ?? '';
const R2_ACCESS_KEY_ID = process.env['R2_ACCESS_KEY_ID'] ?? '';
const R2_SECRET_ACCESS_KEY = process.env['R2_SECRET_ACCESS_KEY'] ?? '';
const R2_BUCKET_NAME = process.env['R2_BUCKET_NAME'] ?? 'torquehub-uploads';
const R2_PUBLIC_URL = process.env['R2_PUBLIC_URL'] ?? '';

/** Indica se o R2 está configurado (todas as env vars presentes). */
export const isR2Configured =
  R2_ACCOUNT_ID.length > 0 &&
  R2_ACCESS_KEY_ID.length > 0 &&
  R2_SECRET_ACCESS_KEY.length > 0 &&
  R2_PUBLIC_URL.length > 0;

/** Cliente S3 apontando para Cloudflare R2. */
const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

/** Faz upload de um buffer para o R2. Retorna a URL pública. */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (!s3Client) {
    throw new Error('R2 não configurado. Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_PUBLIC_URL.');
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/** Remove um objeto do R2 pelo key. */
export async function deleteFromR2(key: string): Promise<void> {
  if (!s3Client) return;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

/** Extrai o key do R2 a partir da URL pública. */
export function extractR2Key(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return null;
  return url.replace(`${R2_PUBLIC_URL}/`, '');
}
