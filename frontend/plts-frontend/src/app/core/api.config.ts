/**
 * Single source of truth for the locally hosted API.
 *
 * Keeping this value shared prevents feature pages from silently pointing at a
 * different server than the authenticated application.
 */
export const API_BASE_URL = 'http://localhost:8085/api/v1';
