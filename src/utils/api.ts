/**
 * Utility function to get cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

/**
 * Get current CSRF token from cookie or localStorage
 */
export const getCsrfToken = (): string => {
  return (
    getCookie('csrfToken') ||
    getCookie('XSRF-TOKEN') ||
    getCookie('xsrf-token') ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('csrfToken') || '' : '')
  );
};

/**
 * Save CSRF Token to localStorage as backup
 */
export const setCsrfToken = (token: string): void => {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem('csrfToken', token);
  }
};

/**
 * Fetch CSRF token from server if not already in cookies or storage
 */
export const ensureCsrfToken = async (): Promise<string> => {
  let token = getCsrfToken();
  if (!token) {
    try {
      const res = await fetch('/api/v1/auth/csrf-token', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.csrfToken) {
        token = data.csrfToken;
        setCsrfToken(token);
      }
    } catch {
      // Ignore network errors during background token fetch
    }
  }
  return token;
};

/**
 * Centralized API fetch wrapper ensuring credentials, CSRF headers, and standard headers
 */
export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const options: RequestInit = { ...init };
  const urlString = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Always include credentials for API requests
  options.credentials = options.credentials || 'include';

  // Prepare headers
  const headers = new Headers(options.headers || {});

  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Set anti-CSRF custom headers for state-changing requests or any API calls
  if (isStateChanging || urlString.includes('/api/')) {
    if (!headers.has('X-Requested-With')) {
      headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    const csrfToken = getCsrfToken();
    if (csrfToken && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  options.headers = headers;
  return fetch(input, options);
};

/**
 * Global fetch interceptor to automatically attach credentials and CSRF security headers
 * to any fetch call matching /api/ across the React application.
 */
export const initFetchInterceptor = (): void => {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  // Prevent double patching
  if ((originalFetch as any).__csrfPatched) return;

  const patchedFetch = function (this: any, input: RequestInfo | URL, init?: RequestInit) {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (typeof urlString === 'string' && urlString.includes('/api/')) {
      init = { ...(init || {}) };
      init.credentials = init.credentials || 'include';

      const method = (init.method || 'GET').toUpperCase();
      const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

      const headers = new Headers(init.headers || {});

      // Send X-Requested-With header for all API requests or state-changing requests
      if (!headers.has('X-Requested-With')) {
        headers.set('X-Requested-With', 'XMLHttpRequest');
      }

      const csrfToken =
        getCookie('csrfToken') ||
        getCookie('XSRF-TOKEN') ||
        (typeof localStorage !== 'undefined' ? localStorage.getItem('csrfToken') : null);

      if (csrfToken && !headers.has('X-CSRF-Token')) {
        headers.set('X-CSRF-Token', csrfToken);
      }

      init.headers = headers;
    }

    return originalFetch.call(this, input, init);
  };

  (patchedFetch as any).__csrfPatched = true;
  try {
    Object.defineProperty(window, 'fetch', {
      value: patchedFetch,
      writable: true,
      configurable: true,
    });
  } catch {
    try {
      (window as any).fetch = patchedFetch;
    } catch (e) {
      console.warn('Could not patch window.fetch:', e);
    }
  }
};
