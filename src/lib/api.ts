const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const resolveDefaultApiBaseUrl = (): string => {
    // In local development, the backend runs on 5050.
    if (import.meta.env.DEV) {
        return `${window.location.protocol}//${window.location.hostname}:5050`;
    }

    // In deployed environments, default to same-origin and let the reverse proxy route /api.
    return window.location.origin;
};

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = trimTrailingSlash(
    new URL(configuredApiBase || resolveDefaultApiBaseUrl(), window.location.origin).toString(),
);

export const FRONTEND_REDIRECT_URL = new URL(import.meta.env.BASE_URL, window.location.origin).toString();

export const apiUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};
