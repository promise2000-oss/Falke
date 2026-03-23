import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Moon, Sun, Rocket, Mail,
  ArrowRight, Eye, EyeOff, Lock, User, Phone, AtSign, CheckCircle2, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/use-theme';

type SignupStep = 'options' | 'email-form';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'Minimum 8 characters',       test: (pw) => pw.length >= 8 },
  { label: 'Must contain uppercase',      test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Must contain lowercase',      test: (pw) => /[a-z]/.test(pw) },
  { label: 'Must contain a digit',        test: (pw) => /\d/.test(pw) },
  { label: 'Must contain special character', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export default function Signup() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<SignupStep>('options');

  // Email form fields
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [phone, setPhone]               = useState('');
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // ── Password rule checks ──────────────────────────────────────────────────
  const allRulesPassed = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithProvider('google');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      let msg = 'Failed to sign up with Google. Please try again.';
      if (e.code === 'auth/popup-closed-by-user') msg = 'Sign-up cancelled';
      else if (e.code === 'auth/popup-blocked') msg = 'Pop-up blocked. Please enable pop-ups for this site';
      else if (e.message?.includes('not configured')) msg = e.message!;
      else if (e.message?.includes('Failed to fetch') || e.message?.includes('Unable to connect'))
        msg = 'Unable to connect to authentication server. Please check your internet connection and try again.';
      else if (e.message?.includes('CORS')) msg = 'Connection blocked by security settings. Please contact support.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Email form submit ─────────────────────────────────────────────────────
  const handleEmailSignup = async () => {
    if (!firstName.trim())         { setError('Please enter your first name.');        return; }
    if (!lastName.trim())          { setError('Please enter your last name.');         return; }
    if (!username.trim())          { setError('Please enter a username.');             return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                   { setError('Please enter a valid email address.');  return; }
    if (!allRulesPassed)           { setError('Password does not meet all requirements.'); return; }
    if (!passwordsMatch)           { setError('Passwords do not match.');              return; }

    setError('');
    setIsEmailLoading(true);
    try {
      // TODO: replace with your actual signup logic
      // e.g. await createUserWithEmailAndPassword(auth, email, password)
      // then save firstName, lastName, username, phone to your DB
      await new Promise((r) => setTimeout(r, 1200));
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      let msg = 'Failed to create account. Please try again.';
      if (e.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      else if (e.code === 'auth/invalid-email')   msg = 'Invalid email address.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Features list ─────────────────────────────────────────────────────────
  const features = [
    '🎓 Access 100+ curated courses',
    '📊 Track your learning progress',
    '🏆 Earn certificates & badges',
    '👥 Join a community of learners',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
            onClick={() => { setStep('options'); setError(''); }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
          >
            {step === 'email-form'
              ? <Mail className="w-8 h-8 text-white" />
              : <Rocket className="w-8 h-8 text-white" />
            }
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
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Join the Future! 🚀</h1>
                  <p className="text-muted-foreground text-lg">Start your learning journey today</p>
                </>
              )}
              {step === 'email-form' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Create your account 📧</h1>
                  <p className="text-muted-foreground">Fill in your details to get started</p>
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
                Sign up with Google
              </button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Email */}
              <button
                onClick={() => { setError(''); setStep('email-form'); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm"
              >
                <Mail className="w-5 h-5 text-primary" />
                Sign up with Email
              </button>
            </motion.div>
          )}

          {/* ── STEP: email-form ── */}
          {step === 'email-form' && (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* First name + Last name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Username */}
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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

              {/* Password requirements — animated, shows when password field has content or is focused */}
              <AnimatePresence>
                {(passwordFocused || password.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-accent/20 rounded-xl border border-border space-y-1.5">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <motion.div
                            key={rule.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{ scale: passed ? [1, 1.3, 1] : 1 }}
                              transition={{ duration: 0.25 }}
                            >
                              {passed
                                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                : <XCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                              }
                            </motion.div>
                            <motion.span
                              animate={{ color: passed ? '#22c55e' : undefined }}
                              className={`text-xs transition-colors ${passed ? 'text-green-500' : 'text-muted-foreground'}`}
                            >
                              {rule.label}
                            </motion.span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSignup()}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-500 focus:ring-green-500/30'
                        : 'border-destructive focus:ring-destructive/30'
                      : 'border-border focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm password match hint */}
              <AnimatePresence>
                {confirmPassword.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs flex items-center gap-1.5 -mt-1 ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {passwordsMatch
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                      : <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                    }
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleEmailSignup}
                disabled={isEmailLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow mt-2"
              >
                {isEmailLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Features List — only on options step */}
        <AnimatePresence>
          {step === 'options' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-accent/30 rounded-2xl border border-border"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                What you'll get:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {step === 'options' && (
          <div className="text-center space-y-4 mt-8">
            <p className="text-sm text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}