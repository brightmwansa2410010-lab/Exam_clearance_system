const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function apiFetch(endpoint, token, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      return { expired: true, error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return data;

  } catch (error) {
    console.error('API fetch error:', error);
    return { error: 'Unable to connect to server. Is the backend running?' };
  }
}
