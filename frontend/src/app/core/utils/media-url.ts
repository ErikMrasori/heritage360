import { environment } from '../../../environments/environment';

function getBackendOrigin(): string {
  try {
    return new URL(environment.apiUrl).origin;
  } catch {
    return '';
  }
}

export function resolveMediaUrl(mediaUrl: string | null | undefined): string | null {
  if (!mediaUrl) {
    return null;
  }

  const trimmed = mediaUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const backendOrigin = getBackendOrigin();
  const normalized = trimmed.replace(/\\/g, '/');

  if (normalized.startsWith('/uploads/')) {
    return backendOrigin ? `${backendOrigin}${normalized}` : normalized;
  }

  if (normalized.startsWith('uploads/')) {
    return backendOrigin ? `${backendOrigin}/${normalized}` : `/${normalized}`;
  }

  const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const uploadPath = normalized.slice(uploadsIndex);
    return backendOrigin ? `${backendOrigin}${uploadPath}` : uploadPath;
  }

  return trimmed;
}
