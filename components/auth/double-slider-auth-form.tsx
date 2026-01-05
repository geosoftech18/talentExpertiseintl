"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';

export default function DoubleSliderAuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleToggle = () => {
    if (isLoading || socialLoading !== null) return;
    setIsSignUp(!isSignUp);
    setErrors({});
    setForgotPasswordMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (!isSignUp) {
        // Login with credentials
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ submit: 'Invalid email or password' });
          setIsLoading(false);
          return;
        }

        router.push('/');
        router.refresh();
      } else {
        // Sign up
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName,
            lastName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({ submit: data.error || 'Failed to create account' });
          setIsLoading(false);
          return;
        }

        // After signup, automatically log in
        const loginResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginResult?.error) {
          setErrors({ submit: 'Account created but login failed. Please try logging in.' });
          setIsLoading(false);
          return;
        }

        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
      if (!errors.submit) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          rememberMe: false
        });
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    if (isLoading || socialLoading !== null) return;
    
    console.log(`Attempting ${provider} login...`);
    setSocialLoading(provider);
    
    try {
      await signIn(provider, {
        callbackUrl: window.location.origin,
        redirect: true,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setErrors({ submit: `Failed to sign in with ${provider}. Please check your OAuth configuration.` });
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setForgotPasswordMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrors({ submit: data.error || 'Failed to send reset email' });
        setIsLoading(false);
        return;
      }

      setForgotPasswordMessage('If an account with that email exists, we have sent a password reset link. Please check your email.');
      setIsLoading(false);
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  // Mobile View - Simple Form
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-start justify-center px-4 pt-4 pb-2">
        <div className="w-full max-w-md mt-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            {!isSignUp ? (
              // Login Form
              <>
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Sign in</h1>

                <div className="flex gap-4 mb-4 justify-center">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading || socialLoading !== null}
                    className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('linkedin')}
                    disabled={isLoading || socialLoading !== null}
                    className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'linkedin' ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                      <svg className="w-6 h-6" fill="#0077B5" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                  </button>
                </div>

                <p className="text-center text-slate-500 text-sm mb-6">or use your account</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full pl-12 pr-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full pl-12 pr-12 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      disabled={isLoading || socialLoading !== null}
                      className="text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  {forgotPasswordMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{forgotPasswordMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || socialLoading !== null}
                    className="w-full py-3 text-base bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-slate-600 text-sm">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={handleToggle}
                        className="text-blue-500 hover:text-blue-600 font-semibold"
                      >
                        Create account
                      </button>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              // Sign Up Form
              <>
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Create Account</h1>

                <div className="flex gap-4 mb-4 justify-center">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading || socialLoading !== null}
                    className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('linkedin')}
                    disabled={isLoading || socialLoading !== null}
                    className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'linkedin' ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                      <svg className="w-6 h-6" fill="#0077B5" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                  </button>
                </div>

                <p className="text-center text-slate-500 text-sm mb-6">or use your email for registration</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        className="w-full pl-12 pr-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full pl-12 pr-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full pl-12 pr-12 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-12 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || socialLoading !== null}
                    className="w-full py-3 text-base bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Sign up'
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-slate-600 text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={handleToggle}
                        className="text-blue-500 hover:text-blue-600 font-semibold"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop View - Slider Animation (Original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl min-h-[600px] md:h-[600px] lg:h-[650px] relative">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative w-full h-full flex flex-col md:flex-row">

            {/* Sign In Form - Top/Left Side Initially */}
            <motion.div
              key="signin-form"
              initial={false}
              animate={{
                x: isMobile ? '0%' : (isSignUp ? '100%' : '0%'),
                y: isMobile ? (isSignUp ? '100%' : '0%') : '0%'
              }}
              transition={{
                duration: 0.7,
                ease: [0.68, -0.55, 0.265, 1.55]
              }}
              className="absolute left-0 top-0 w-full md:w-1/2 h-1/2 md:h-full bg-white z-20"
            >
              <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 sm:mb-6 md:mb-8">Sign in</h1>

                  <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-3 justify-center">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading || socialLoading !== null}
                      className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('linkedin')}
                      disabled={isLoading || socialLoading !== null}
                      className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'linkedin' ? (
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#0077B5" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-slate-500 text-xs sm:text-sm mb-3 sm:mb-6">or use your account</p>

                  <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <label className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-slate-600">Remember me</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        disabled={isLoading || socialLoading !== null}
                        className="text-blue-500 hover:text-blue-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}

                    {forgotPasswordMessage && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">{forgotPasswordMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || socialLoading !== null}
                      className="w-full py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Sign Up Form - Top/Right Side (when isSignUp is true) */}
            <motion.div
              key="signup-form"
              initial={false}
              animate={{
                x: isMobile ? '0%' : (isSignUp ? '-100%' : '0%'),
                y: isMobile ? (isSignUp ? '-100%' : '100%') : '0%'
              }}
              transition={{
                duration: 0.7,
                ease: [0.68, -0.55, 0.265, 1.55]
              }}
              className="absolute right-0 top-0 md:top-0 w-full md:w-1/2 h-1/2 md:h-full bg-white z-20"
              style={{ left: isMobile ? '0' : '100%', top: isMobile ? '100%' : '0' }}
            >
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-6 lg:p-8 overflow-hidden">
                <div className="w-full max-w-md">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 sm:mb-6 md:mb-8">Create Account</h1>

                  <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-3 justify-center">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading || socialLoading !== null}
                      className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('linkedin')}
                      disabled={isLoading || socialLoading !== null}
                      className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'linkedin' ? (
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#0077B5" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3">or use your email for registration</p>

                  <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Name"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm Password"
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || socialLoading !== null}
                      className="w-full py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        'Sign up'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Orange "Hello Friend" Card - Bottom/Right Side Initially */}
            <motion.div
              key="hello-card"
              initial={false}
              animate={{
                x: isMobile ? '0%' : (isSignUp ? '-100%' : '0%'),
                y: isMobile ? (isSignUp ? '-100%' : '0%') : '0%'
              }}
              transition={{
                duration: 0.7,
                ease: [0.68, -0.55, 0.265, 1.55]
              }}
              className="absolute right-0 bottom-0 md:top-0 w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-blue-500 to-indigo-500 z-10"
            >
              <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-12">
                <div className="text-center text-white max-w-md">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Hello, Friend!</h2>
                  <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed opacity-90">
                    Enter your personal details and start journey with us
                  </p>
                  <button
                    onClick={handleToggle}
                    className="px-8 sm:px-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-500 transition-all transform hover:scale-105"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Orange "Welcome Back" Card - Bottom/Left Side (when isSignUp is true) */}
            <motion.div
              key="welcome-card"
              initial={false}
              animate={{
                x: isMobile ? '0%' : (isSignUp ? '100%' : '0%'),
                y: isMobile ? (isSignUp ? '100%' : '-100%') : '0%'
              }}
              transition={{
                duration: 0.7,
                ease: [0.68, -0.55, 0.265, 1.55]
              }}
              className="absolute left-0 bottom-0 md:top-0 w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-blue-500 to-indigo-500 z-10"
              style={{ right: isMobile ? 'auto' : '100%', bottom: isMobile ? '100%' : 'auto' }}
            >
              <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-12">
                <div className="text-center text-white max-w-md">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Welcome Back!</h2>
                  <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed opacity-90">
                    To keep connected with us please login with your personal info
                  </p>
                  <button
                    onClick={handleToggle}
                    className="px-8 sm:px-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-500 transition-all transform hover:scale-105"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

    </div>
  );
}

