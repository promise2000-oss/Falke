import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, Moon, ShieldCheck, Sun } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../components/ui/input';
import { useTheme } from '../hooks/use-theme';
import { resetPassword } from '../utils/authApi';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const initialResetCode = (
    routeToken ||
    searchParams.get('token') ||
    searchParams.get('resetToken') ||
    searchParams.get('code') ||
    searchParams.get('otp') ||
    ''
  ).trim();
  const initialEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const initialUid = (searchParams.get('uid') || '').trim();

  const [email, setEmail] = useState(initialEmail);
  const [resetCode, setResetCode] = useState(initialResetCode);
  const [uid, setUid] = useState(initialUid);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoutAllDevices, setLogoutAllDevices] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const passwordChecks = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
      { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const requirementsMet = passwordChecks.every((item) => item.met);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const strengthScore = passwordChecks.filter((item) => item.met).length + (password.length >= 12 ? 1 : 0);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasResetCode = resetCode.trim().length >= 6;

  const strength =
    strengthScore <= 2
      ? { label: 'Weak', textClass: 'text-destructive', barClass: 'bg-destructive', widthClass: 'w-1/3' }
      : strengthScore <= 4
        ? { label: 'Medium', textClass: 'text-amber-500', barClass: 'bg-amber-500', widthClass: 'w-2/3' }
        : { label: 'Strong', textClass: 'text-[#0fbd74]', barClass: 'bg-[#0fbd74]', widthClass: 'w-full' };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailIsValid) {
      setError('Enter the email address that received the reset OTP PIN.');
      return;
    }

    if (!hasResetCode) {
      setError('Enter the full OTP PIN sent to your email.');
      return;
    }

    if (!requirementsMet) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    if (!passwordsMatch) {
      setError('Your passwords do not match yet.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword({
        uid,
        token: resetCode,
        otp: resetCode,
        code: resetCode,
        pin: resetCode,
        email,
        password,
        confirmPassword,
        logoutAllDevices,
      });
      setIsComplete(true);
      toast.success('Password updated successfully.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to reset your password.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-md p-8 md:p-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Password reset complete</h1>
          <p className="text-muted-foreground mb-6">
            Your account is secure again. {logoutAllDevices ? 'Other active sessions will be asked to sign in again.' : 'You can keep using your current sessions.'}
          </p>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Recommended next step</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your email OTP PIN has been confirmed. Enable multi-factor authentication in your security settings for extra protection.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true, state: { email, passwordResetSuccess: true } })}
            className="w-full rounded-xl px-4 py-3 bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all shadow-glow"
          >
            Continue to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-all shadow-md z-10"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-lg p-8 md:p-10"
      >
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Request another OTP PIN</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Create a new password</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Enter the OTP PIN sent to {email || 'your email address'} and choose a strong new password.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm mb-6 text-muted-foreground">
          We sent a 6-digit OTP PIN to your email. Enter it below to continue with your password reset.
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the same email address that received the reset OTP PIN.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reset-code" className="text-sm font-medium text-foreground">
              OTP PIN
            </label>
            <Input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={resetCode}
              onChange={(event) => {
                setResetCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12));
                if (error) {
                  setError('');
                }
              }}
              placeholder="Enter the code sent to your email"
              className="h-12 rounded-xl text-center font-semibold tracking-[0.35em]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium text-foreground">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
                className="pl-10 pr-11 h-12 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Password strength</span>
              <span className={`font-semibold ${password ? strength.textClass : 'text-muted-foreground'}`}>
                {password ? strength.label : '—'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${password ? `${strength.widthClass} ${strength.barClass}` : 'w-0'}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                className="pl-10 pr-11 h-12 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs font-medium ${passwordsMatch ? 'text-primary' : 'text-destructive'}`}>
                {passwordsMatch ? 'Passwords match.' : 'Passwords do not match yet.'}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Security requirements</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {passwordChecks.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${item.met ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={logoutAllDevices}
              onChange={(event) => setLogoutAllDevices(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>
              <span className="text-sm font-semibold text-foreground block">Log out of all other devices</span>
              <span className="text-xs text-muted-foreground">
                Recommended after a password reset for improved session security.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !emailIsValid || !hasResetCode || !requirementsMet || !passwordsMatch}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
