import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';

import {
  extractGoogleCredential,
  getGoogleAuthErrorMessage,
  isGoogleAuthConfigured,
} from '@/lib/auth';

type GoogleLoginButtonMode = 'login' | 'signup';

interface GoogleLoginButtonProps {
  mode?: GoogleLoginButtonMode;
  themeMode?: 'light' | 'dark';
  isLoading?: boolean;
  width?: string;
  onToken: (token: string) => Promise<void> | void;
  onFailure?: (message: string) => void;
}

export default function GoogleLoginButton({
  mode = 'login',
  themeMode = 'light',
  isLoading = false,
  width = '300',
  onToken,
  onFailure,
}: GoogleLoginButtonProps) {
  const isConfigured = isGoogleAuthConfigured();
  const fallbackLabel = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  const emitFailure = (message: string) => {
    if (onFailure) {
      onFailure(message);
      return;
    }

    toast.error(message);
  };

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const token = extractGoogleCredential(credentialResponse);
      await onToken(token);
    } catch (error) {
      emitFailure(error instanceof Error ? error.message : 'Failed to continue with Google.');
    }
  };

  const handleError = () => {
    emitFailure(getGoogleAuthErrorMessage());
  };

  if (!isConfigured) {
    return (
      <button
        type="button"
        onClick={handleError}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm"
      >
        {fallbackLabel}
      </button>
    );
  }

  return (
    <div className="w-full flex items-center justify-center rounded-xl border border-border bg-card hover:bg-accent/40 transition-all py-2">
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            void handleSuccess(credentialResponse);
          }}
          onError={handleError}
          useOneTap
          text={mode === 'signup' ? 'signup_with' : 'continue_with'}
          theme={themeMode === 'light' ? 'outline' : 'filled_black'}
          shape="pill"
          width={width}
        />
      )}
    </div>
  );
}
