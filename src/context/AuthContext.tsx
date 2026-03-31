import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateToken } from '../utils/api';
import { API_BASE_URL } from '../config/api';
import { extractAuthSession, getOAuthUrl, loginWithGoogleToken, logoutUser, type AuthSession, type AuthUser } from '../utils/authApi';

/**
 * Backend API URL - auto-detected by environment.
 * Override with VITE_API_URL environment variable.
 * See src/config/api.ts for URL configuration.
 */
const API_URL = API_BASE_URL;

// Supported OAuth providers
type OAuthProvider = 'google' | 'microsoft' | 'github';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signInWithGoogleToken: (token: string) => Promise<AuthUser>;
  setAuthSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('aurikrex-user');
    const token = localStorage.getItem('aurikrex-token');

    if (storedUser && token) {
      try {
        // Validate token before setting user
        if (validateToken()) {
          setUser(JSON.parse(storedUser) as AuthUser);
        } else {
          // Token is invalid or expired, clear storage
          localStorage.removeItem('aurikrex-user');
          localStorage.removeItem('aurikrex-token');
          localStorage.removeItem('aurikrex-refresh-token');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('aurikrex-user');
        localStorage.removeItem('aurikrex-token');
        localStorage.removeItem('aurikrex-refresh-token');
      }
    }
    setLoading(false);
  }, []);

  const setAuthSession = ({ token, refreshToken, user }: AuthSession) => {
    setUser(user);
    localStorage.setItem('aurikrex-token', token);
    localStorage.setItem('aurikrex-user', JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem('aurikrex-refresh-token', refreshToken);
    } else {
      localStorage.removeItem('aurikrex-refresh-token');
    }
  };

  const signInWithGoogleToken = async (token: string): Promise<AuthUser> => {
    const result = await loginWithGoogleToken(token);
    const session = extractAuthSession(result);

    if (!session) {
      throw new Error('Google sign-in succeeded but no session was returned by the server.');
    }

    setAuthSession(session);
    return session.user;
  };

  /**
   * Sign in with OAuth provider (Google, Microsoft, or GitHub)
   * 
   * This function fetches the OAuth authorization URL from the backend
   * and redirects the user to the OAuth provider's login page.
   * The OAuth flow will redirect back to /auth/callback with tokens.
   */
  const signInWithProvider = async (provider: OAuthProvider) => {
    const requestUrl = `${API_URL}/auth/${provider}/url/`;
    
    try {
      console.log(`🔐 Initiating ${provider} OAuth flow...`);
      console.log(`📡 Request URL: ${requestUrl}`);
      
      // Check if API URL is configured
      if (!API_URL) {
        const error = new Error('Backend API URL is not configured. Please contact support.');
        console.error('❌ OAuth Error:', {
          error: error.message,
          hint: 'Set VITE_API_URL environment variable in Vercel dashboard',
        });
        throw error;
      }
      
      const oauthUrl = await getOAuthUrl(provider);
      console.log(`✅ Got ${provider} OAuth URL, redirecting...`);
      console.log(`🔗 Redirect URL: ${oauthUrl.substring(0, 100)}...`);

      // Redirect to OAuth provider (browser redirect, not fetch)
      // This is correct - OAuth flows require full page redirect
      window.location.href = oauthUrl;
    } catch (error) {
      // Comprehensive error logging for debugging
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error signing in with ${provider}:`, {
        requestUrl,
        errorMessage: err.message,
        errorName: err.name,
        errorStack: err.stack,
        currentOrigin: window.location.origin,
        apiUrl: API_URL,
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aurikrex-user');
    localStorage.removeItem('aurikrex-token');
    localStorage.removeItem('aurikrex-refresh-token');
    
    // Also call backend logout to clear cookies
    if (API_URL) {
      void logoutUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithProvider, signInWithGoogleToken, setAuthSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
