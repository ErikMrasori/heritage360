function normalizeMediaUrlForStorage(mediaUrl) {
  if (typeof mediaUrl !== "string") {
    return mediaUrl;
  }

  const trimmed = mediaUrl.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith("/uploads/")) {
        return parsed.pathname;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalized = trimmed.replace(/\\/g, "/");

  if (normalized.startsWith("/uploads/")) {
    return normalized;
  }

  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }

  const uploadsIndex = normalized.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsIndex !== -1) {
    return normalized.slice(uploadsIndex);
  }

  return trimmed;
}

module.exports = { normalizeMediaUrlForStorage };
