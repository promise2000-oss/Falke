import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Moon, Sun, Phone, ArrowRight, RotateCcw, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/use-theme';

type LoginStep = 'options' | 'phone' | 'otp' | 'email';

export default function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('options');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithProvider('google');
    } catch (err) {
      console.error('Google sign-in error:', err);
      const e = err as { code?: string; message?: string };
      let msg = 'Failed to sign in with Google. Please try again.';
      if (e.code === 'auth/popup-closed-by-user') msg = 'Sign-in cancelled';
      else if (e.code === 'auth/popup-blocked') msg = 'Pop-up blocked. Please enable pop-ups for this site';
      else if (e.message?.includes('not configured')) msg = e.message!;
      else if (e.message?.includes('Failed to fetch') || e.message?.includes('Unable to connect')) {
        msg = 'Unable to connect to authentication server. Please check your internet connection and try again.';
        console.error('Network error details - check browser Network tab for CORS issues:', e);
      } else if (e.message?.includes('CORS')) msg = 'Connection blocked by security settings. Please contact support.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Email + Password ──────────────────────────────────────────────────────
  const handleEmailSignIn = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setError('');
    setIsEmailLoading(true);
    try {
      // TODO: replace with your actual email/password sign-in logic
      // e.g. await signInWithEmailAndPassword(auth, email, password);
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      let msg = 'Failed to sign in. Please check your credentials and try again.';
      if (e.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (e.code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.';
      else if (e.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
      else if (e.code === 'auth/invalid-email') msg = 'Invalid email address.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Phone: send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setIsPhoneLoading(true);
    try {
      // TODO: replace with your actual OTP send logic
      // e.g. await sendOtp(`${countryCode}${phoneNumber}`);
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('OTP sent! Check your messages.');
      setStep('otp');
      startResendTimer();
    } catch {
      const msg = 'Failed to send OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPhoneLoading(false);
    }
  };

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setIsOtpLoading(true);
    try {
      // TODO: replace with your actual OTP verify logic
      // e.g. await verifyOtp(`${countryCode}${phoneNumber}`, code);
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch {
      const msg = 'Invalid or expired code. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); document.getElementById('otp-5')?.focus(); }
  };

  // ── Resend timer ──────────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setIsPhoneLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      startResendTimer();
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const countryCodes = [
    { code: '+1',   label: '🇺🇸 +1'   },
    { code: '+44',  label: '🇬🇧 +44'  },
    { code: '+91',  label: '🇮🇳 +91'  },
    { code: '+234', label: '🇳🇬 +234' },
    { code: '+49',  label: '🇩🇪 +49'  },
    { code: '+33',  label: '🇫🇷 +33'  },
    { code: '+61',  label: '🇦🇺 +61'  },
    { code: '+55',  label: '🇧🇷 +55'  },
    { code: '+27',  label: '🇿🇦 +27'  },
  ];

  const getStepBack = (): LoginStep => {
    if (step === 'otp') return 'phone';
    return 'options';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-all shadow-md z-10"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-md p-8 md:p-10"
      >
        {/* Back button */}
        {step === 'options' ? (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        ) : (
          <button
            onClick={() => { setStep(getStepBack()); setError(''); }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
          >
            {step === 'phone' || step === 'otp' ? (
              <Phone className="w-8 h-8 text-white" />
            ) : step === 'email' ? (
              <Mail className="w-8 h-8 text-white" />
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {step === 'options' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Welcome back! 👋</h1>
                  <p className="text-muted-foreground text-lg">Sign in to continue your learning journey</p>
                </>
              )}
              {step === 'email' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Sign in with email 📧</h1>
                  <p className="text-muted-foreground">Enter your credentials to continue</p>
                </>
              )}
              {step === 'phone' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Enter your number 📱</h1>
                  <p className="text-muted-foreground">We'll send a one-time code to sign you in</p>
                </>
              )}
              {step === 'otp' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Check your texts ✉️</h1>
                  <p className="text-muted-foreground">
                    Code sent to{' '}
                    <span className="font-semibold text-foreground">{countryCode} {phoneNumber}</span>
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── STEP: options ── */}
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Email */}
              <button
                onClick={() => { setError(''); setStep('email'); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm"
              >
                <Mail className="w-5 h-5 text-primary" />
                Continue with Email
              </button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                {/* <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground">or</span>
                </div> */}
              </div>

              {/* Mobile */}
              {/* <button
                onClick={() => { setError(''); setStep('phone'); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm"
              >
                <Phone className="w-5 h-5 text-primary" />
                Continue with Mobile Number
              </button> */}
            </motion.div>
          )}

          {/* ── STEP: email ── */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Email field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('password-input')?.focus()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                onClick={handleEmailSignIn}
                disabled={isEmailLoading || !email.trim() || !password}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                {isEmailLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}

          {/* ── STEP: phone ── */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  maxLength={15}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isPhoneLoading || !phoneNumber.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                {isPhoneLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to receive an SMS. Standard rates may apply.
              </p>
            </motion.div>
          )}

          {/* ── STEP: otp ── */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-11 h-13 text-center text-lg font-bold rounded-xl border-2 border-border bg-card text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isOtpLoading || otp.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                {isOtpLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Didn't get it?</span>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isPhoneLoading}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 font-semibold disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Divider & Footer — only on options step */}
        {step === 'options' && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Secure Authentication</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors focus:outline-none focus:underline"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}