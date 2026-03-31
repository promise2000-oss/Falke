import type { CredentialResponse } from '@react-oauth/google';

export const getGoogleClientId = (): string => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
};

export const isGoogleAuthConfigured = (): boolean => {
  return Boolean(getGoogleClientId());
};

export const getGoogleAuthErrorMessage = (): string => {
  return isGoogleAuthConfigured()
    ? 'Google sign-in was cancelled or could not be started.'
    : 'Google Sign-In is not configured. Add `VITE_GOOGLE_CLIENT_ID` to your frontend environment.';
};

export const extractGoogleCredential = (credentialResponse: CredentialResponse): string => {
  const token = credentialResponse.credential?.trim();

  if (!token) {
    throw new Error('Google sign-in did not return a valid token.');
  }

  return token;
};

export const getPostAuthRoute = (role?: string): string => {
  return role === 'admin' ? '/admin' : '/dashboard';
};
