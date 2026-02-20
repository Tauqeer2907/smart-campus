/**
 * SafeCampus API Service
 * All backend calls go through here.
 * Falls back gracefully if the server is offline.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken(): string | null {
    try {
        const session = localStorage.getItem('unicampus_session_2026');
        if (!session) return null;
        const parsed = JSON.parse(session);
        return parsed?.token ?? null;
    } catch {
        return null;
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> ?? {}),
    };

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
        const json = await res.json();
        return json;
    } catch (err) {
        console.warn('[API] Request failed:', endpoint, err);
        return { success: false, message: 'Server offline — using local data' };
    }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const api = {
    auth: {
        login: (email: string, password: string, role: string) =>
            request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, role }),
            }),

        register: (data: {
            name: string;
            email: string;
            password: string;
            role: string;
            studentId?: string;
            facultyId?: string;
            branch?: string;
            year?: number;
        }) =>
            request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        me: () => request('/api/auth/me'),
    },

    // ─── Events ──────────────────────────────────────────────────────────────

    events: {
        getAll: () => request('/api/events'),

        create: (data: {
            title: string;
            description: string;
            date: string;
            venue: string;
            type: string;
        }) =>
            request('/api/events', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            request(`/api/events/${id}`, { method: 'DELETE' }),

        register: (id: string) =>
            request(`/api/events/${id}/register`, { method: 'POST' }),

        unregister: (id: string) =>
            request(`/api/events/${id}/register`, { method: 'DELETE' }),

        getRegistrations: (id: string) =>
            request(`/api/events/${id}/registrations`),

        myRegistrations: () =>
            request('/api/events/my-registrations'),
    },

    // ─── Notifications ──────────────────────────────────────────────────────

    notifications: {
        get: () => request('/api/notifications'),
    },
};

export default api;
