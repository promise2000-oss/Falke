import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, MailCheck, Moon, RotateCcw, Sun } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/use-theme';
import { extractAuthSession, resendOtpCode, verifyOtpCode } from '../utils/authApi';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

interface OtpLocationState {
  email?: string;
  firstName?: string;
}

export default function OtpVerification() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { setAuthSession } = useAuth();

  const navigationState = (location.state as OtpLocationState | null) ?? null;
  const email = (searchParams.get('email') || navigationState?.email || '').trim().toLowerCase();
  const firstName = navigationState?.firstName?.trim();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendTimer((currentValue) => (currentValue <= 1 ? 0 : currentValue - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const handleVerifyOtp = async () => {
    if (!email) {
      setError('Missing email address. Please sign up again.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const result = await verifyOtpCode({ email, otp });
      const response = (result ?? {}) as { message?: string };
      const session = extractAuthSession(result, { email, firstName, emailVerified: true });

      toast.success(response.message || 'OTP verified successfully.');

      if (session) {
        setAuthSession(session);
        navigate(session.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        return;
      }

      navigate('/login', { replace: true, state: { email } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired OTP.';
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendTimer > 0) {
      return;
    }

    setError('');
    setIsResending(true);

    try {
      const result = await resendOtpCode(email);
      const response = (result ?? {}) as { message?: string };

      setOtp('');
      setResendTimer(30);
      toast.success(response.message || 'A new OTP has been sent to your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP.';
      setError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 90, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, -90, 0], y: [0, -40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
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
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-md p-8 md:p-10"
      >
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to sign up</span>
        </Link>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
          >
            <MailCheck className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-3 text-foreground">Verify your OTP</h1>
          <p className="text-muted-foreground">
            {firstName ? `Hi ${firstName}, ` : ''}
            enter the 6-digit code sent to
          </p>
          <p className="text-sm font-semibold text-primary mt-1 break-all">{email || 'your email address'}</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!email ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              No email was provided for verification. Please create your account again.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all"
            >
              Go to sign up
            </Link>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void handleVerifyOtp();
            }}
          >
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, ''));
                  if (error) {
                    setError('');
                  }
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
            >
              {isVerifying ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify OTP
                </>
              )}
            </button>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Didn&apos;t get the code?</p>
              <button
                type="button"
                onClick={() => void handleResendOtp()}
                disabled={isResending || resendTimer > 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already verified?{' '}
              <Link to="/login" state={{ email }} className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
