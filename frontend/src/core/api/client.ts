import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Token keys (must match useAuth.ts)
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get access token from localStorage
 */
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Save tokens to localStorage
 */
const saveTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear tokens from localStorage
 */
const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('token_type');
  localStorage.removeItem('expires_in');
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    saveTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    return null;
  }
};

/**
 * Axios instance with base configuration
 */
export const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Add authentication token, logging, etc.
 */
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // Add authorization header
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Response interceptor
 * Handle common errors globally, including token refresh on 401
 */
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.status
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Silently handle request cancellation (normal behavior in React Query with Strict Mode)
    if (axios.isCancel(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[API] Request cancelled (normal in dev mode)', originalRequest?.url);
      }
      return Promise.reject(error);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry auth endpoints - let the caller handle the error
      if (
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh')
      ) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return AXIOS_INSTANCE(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return AXIOS_INSTANCE(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.error('[API Error] Unauthorized');
          break;
        case 403:
          console.error('[API Error] Forbidden');
          break;
        case 404:
          console.error('[API Error] Not Found');
          break;
        case 409:
          console.error('[API Error] Conflict');
          break;
        case 500:
          console.error('[API Error] Server Error');
          break;
        default:
          console.error(`[API Error] ${status}`, error.message);
      }
    } else if (error.request) {
      console.error('[API Error] No response received', error.message);
    } else {
      console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Custom instance for Orval
 * This function is used as the mutator in orval.config.ts
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - cancel method is dynamically added for React Query compatibility
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
