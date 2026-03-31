import axios from 'axios';

import { API_BASE_URL } from '../config/api';
import { ApiError } from './api';

export interface AuthUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  emailVerified?: boolean;
  provider?: string;
  role?: string;
  username?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface SignupPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  username?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface PasswordResetPayload {
  token?: string;
  otp?: string;
  code?: string;
  pin?: string;
  password: string;
  confirmPassword?: string;
  email?: string;
  logoutAllDevices?: boolean;
}

type JsonRecord = Record<string, unknown>;

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurikrex-token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const isObject = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toCleanString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const readNestedValue = (payload: JsonRecord, ...paths: string[]): unknown => {
  for (const path of paths) {
    const value = path.split('.').reduce<unknown>((current, segment) => {
      if (!isObject(current) || !(segment in current)) {
        return undefined;
      }

      return current[segment];
    }, payload);

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const decodeTokenPayload = (token: string): JsonRecord => {
  try {
    const [, payload] = token.split('.');
    return payload ? (JSON.parse(atob(payload)) as JsonRecord) : {};
  } catch {
    return {};
  }
};

const extractMessage = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (!isObject(payload)) {
    return null;
  }

  const directKeys = ['error', 'message', 'detail', 'non_field_errors'];

  for (const key of directKeys) {
    const value = payload[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }

  for (const [field, value] of Object.entries(payload)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }

    if (typeof value === 'string' && value.trim()) {
      return `${field}: ${value}`;
    }
  }

  return null;
};

const normalizeApiError = (error: unknown, fallbackMessage: string): ApiError => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const message =
      extractMessage(responseData) ||
      error.message ||
      fallbackMessage;

    return new ApiError(message, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      requestUrl: error.config?.url,
      responseData,
      isTimeout: error.code === 'ECONNABORTED',
      isNetworkError: !error.response,
    });
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(error instanceof Error ? error.message : fallbackMessage);
};

const postAuth = async (path: string, payload: JsonRecord, fallbackMessage: string): Promise<unknown> => {
  try {
    const response = await authClient.post(path, payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
};

const postAuthWithFallback = async (
  paths: string[],
  payload: JsonRecord,
  fallbackMessage: string
): Promise<unknown> => {
  let lastError: unknown;

  for (const path of paths) {
    try {
      const response = await authClient.post(path, payload);
      return response.data;
    } catch (error) {
      lastError = error;

      if (!axios.isAxiosError(error) || error.response?.status !== 404 || path === paths[paths.length - 1]) {
        throw normalizeApiError(error, fallbackMessage);
      }
    }
  }

  throw normalizeApiError(lastError, fallbackMessage);
};

export const getOAuthUrl = async (provider: 'google' | 'microsoft' | 'github'): Promise<string> => {
  try {
    const response = await authClient.get(`/auth/${provider}/url/`);
    const payload = response.data as JsonRecord;
    const url = toCleanString(readNestedValue(payload, 'data.url', 'url'));

    if (!url) {
      throw new ApiError('Invalid response from authentication server.');
    }

    return url;
  } catch (error) {
    throw normalizeApiError(error, `Failed to get ${provider} OAuth URL.`);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await authClient.post('/auth/logout/');
  } catch (error) {
    console.error('Logout request failed:', normalizeApiError(error, 'Failed to log out.'));
  }
};

export const signupUser = async ({
  firstName,
  lastName,
  phone,
  username,
  email,
  password,
}: SignupPayload): Promise<unknown> => {
  return postAuth(
    '/auth/signup/',
    {
      email: email.trim().toLowerCase(),
      password,
      first_name: firstName?.trim() || undefined,
      last_name: lastName?.trim() || undefined,
      username: username?.trim() || undefined,
      phone: phone?.trim() || undefined,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
    },
    'Failed to create account.'
  );
};

export const loginUser = async ({ email, password }: LoginPayload): Promise<unknown> => {
  return postAuth(
    '/auth/login/',
    {
      email: email.trim().toLowerCase(),
      password,
    },
    'Failed to sign in.'
  );
};

export const loginWithGoogleToken = async (token: string): Promise<unknown> => {
  return postAuth(
    '/auth/google/',
    {
      token,
    },
    'Failed to sign in with Google.'
  );
};

export const verifyOtpCode = async ({ email, otp }: VerifyOtpPayload): Promise<unknown> => {
  return postAuth(
    '/auth/verify-otp/',
    {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    },
    'Invalid or expired OTP.'
  );
};

export const resendOtpCode = async (email: string): Promise<unknown> => {
  return postAuth(
    '/auth/resend-otp/',
    {
      email: email.trim().toLowerCase(),
    },
    'Failed to resend OTP.'
  );
};

export const requestPasswordReset = async (email: string): Promise<unknown> => {
  const normalizedEmail = email.trim().toLowerCase();
  const resetRedirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;

  return postAuthWithFallback(
    ['/auth/forgot-password/', '/auth/request-password-reset/', '/auth/password-reset/request/'],
    {
      email: normalizedEmail,
      redirect_url: resetRedirectUrl,
      reset_url: resetRedirectUrl,
      client_url: resetRedirectUrl,
    },
    'Unable to send a password reset OTP PIN.'
  );
};

export const resetPassword = async ({
  token,
  otp,
  code,
  pin,
  password,
  confirmPassword,
  email,
  logoutAllDevices = false,
}: PasswordResetPayload): Promise<unknown> => {
  const normalizedEmail = email?.trim().toLowerCase() || undefined;
  const confirmedPassword = confirmPassword ?? password;
  const resetCredential = (token || otp || code || pin || '').trim();

  return postAuthWithFallback(
    ['/auth/reset-password/', '/auth/password-reset/confirm/', '/auth/password-reset/reset/'],
    {
      token: resetCredential,
      otp: resetCredential,
      code: resetCredential,
      pin: resetCredential,
      email: normalizedEmail,
      password,
      confirm_password: confirmedPassword,
      confirmPassword: confirmedPassword,
      password_confirmation: confirmedPassword,
      logout_all_devices: logoutAllDevices,
      logoutAllDevices,
    },
    'Failed to reset your password.'
  );
};

export const extractAuthSession = (
  payload: unknown,
  fallbackUser?: Partial<AuthUser>
): AuthSession | null => {
  if (!isObject(payload)) {
    return null;
  }

  const token = toCleanString(
    readNestedValue(
      payload,
      'token',
      'access',
      'accessToken',
      'access_token',
      'data.token',
      'data.access',
      'data.accessToken',
      'tokens.access'
    )
  );

  if (!token) {
    return null;
  }

  const refreshToken = toCleanString(
    readNestedValue(
      payload,
      'refreshToken',
      'refresh',
      'refresh_token',
      'data.refreshToken',
      'data.refresh',
      'tokens.refresh'
    )
  );

  const tokenClaims = decodeTokenPayload(token);
  const rawUser = readNestedValue(payload, 'user', 'data.user', 'profile');
  const userPayload = isObject(rawUser) ? rawUser : {};

  const email =
    toCleanString(readNestedValue(userPayload, 'email')) ||
    toCleanString(readNestedValue(payload, 'email', 'data.email')) ||
    toCleanString(readNestedValue(tokenClaims, 'email')) ||
    fallbackUser?.email ||
    '';

  const firstName =
    toCleanString(readNestedValue(userPayload, 'first_name', 'firstName')) ||
    toCleanString(readNestedValue(payload, 'first_name', 'firstName', 'data.first_name', 'data.firstName')) ||
    toCleanString(readNestedValue(tokenClaims, 'first_name', 'firstName')) ||
    fallbackUser?.firstName;

  const lastName =
    toCleanString(readNestedValue(userPayload, 'last_name', 'lastName')) ||
    toCleanString(readNestedValue(payload, 'last_name', 'lastName', 'data.last_name', 'data.lastName')) ||
    toCleanString(readNestedValue(tokenClaims, 'last_name', 'lastName')) ||
    fallbackUser?.lastName;

  const displayName =
    toCleanString(readNestedValue(userPayload, 'display_name', 'displayName')) ||
    toCleanString(readNestedValue(payload, 'display_name', 'displayName', 'data.display_name', 'data.displayName')) ||
    fallbackUser?.displayName ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    email.split('@')[0] ||
    'User';

  const uid =
    toCleanString(readNestedValue(userPayload, 'uid', 'id', 'user_id')) ||
    toCleanString(readNestedValue(payload, 'uid', 'id', 'user_id', 'data.uid', 'data.id')) ||
    toCleanString(readNestedValue(tokenClaims, 'uid', 'user_id', 'sub')) ||
    fallbackUser?.uid ||
    email;

  const phone =
    toCleanString(readNestedValue(userPayload, 'phone', 'phone_number', 'phoneNumber')) ||
    toCleanString(readNestedValue(payload, 'phone', 'phone_number', 'phoneNumber', 'data.phone')) ||
    fallbackUser?.phone;

  const username =
    toCleanString(readNestedValue(userPayload, 'username')) ||
    toCleanString(readNestedValue(payload, 'username', 'data.username')) ||
    fallbackUser?.username;

  const provider =
    toCleanString(readNestedValue(userPayload, 'provider')) ||
    toCleanString(readNestedValue(payload, 'provider', 'data.provider')) ||
    fallbackUser?.provider ||
    'email';

  const role =
    toCleanString(readNestedValue(userPayload, 'role')) ||
    toCleanString(readNestedValue(payload, 'role', 'data.role')) ||
    toCleanString(readNestedValue(tokenClaims, 'role')) ||
    fallbackUser?.role ||
    'student';

  const emailVerifiedValue =
    readNestedValue(userPayload, 'emailVerified', 'email_verified') ??
    readNestedValue(payload, 'emailVerified', 'email_verified', 'data.emailVerified', 'data.email_verified');

  const emailVerified =
    typeof emailVerifiedValue === 'boolean' ? emailVerifiedValue : fallbackUser?.emailVerified ?? true;

  return {
    token,
    refreshToken,
    user: {
      uid,
      email,
      firstName,
      lastName,
      displayName,
      phone,
      photoURL: fallbackUser?.photoURL,
      emailVerified,
      provider,
      role,
      username,
    },
  };
};
