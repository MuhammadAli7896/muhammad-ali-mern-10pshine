import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/notes');
        }
    }, [isAuthenticated, navigate]);

    // Prevent background scrolling and manage focus when modal opens
    useEffect(() => {
        if (showForgotModal) {
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
            
            // Move focus to modal
            if (modalRef.current) {
                modalRef.current.focus();
            }
        } else {
            // Restore background scrolling
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showForgotModal]);

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showForgotModal) {
                setShowForgotModal(false);
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showForgotModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!password) {
            toast.error('Please enter your password');
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/notes');
        } catch (error: unknown) {
            const message = (error as Error).message || 'Login failed. Please try again.';
            toast.error(message);
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 px-4 py-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-6 lg:gap-12">

                    {/* Left Section - Form */}
                    <div className="w-full lg:w-1/2 max-w-md">
                        {/* Auth Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8">
                            {/* Form Title */}
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
                                Welcome Back!
                            </h2>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                {/* Password Field */}
                                <PasswordInput
                                    id="password"
                                    label="Password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />

                                {/* Forgot Password Link */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        disabled={isSubmitting}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 lg:py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="mt-4 lg:mt-6 flex items-center">
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            </div>

                            {/* Additional Info */}
                            <p className="mt-4 lg:mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Back to Home */}
                        <div className="mt-4 lg:mt-6 text-center">
                            <Link
                                to="/"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>

                    {/* Right Section - Illustration */}
                    <div className="hidden lg:flex w-1/2 items-center justify-center">
                        <img
                            src="/login-illustration.svg"
                            alt="Login Illustration"
                            className="w-full max-w-sm xl:max-w-md drop-shadow-2xl"
                        />
                    </div>

                </div>
            </div>

            {/* Forgot Password Modal */}
                {showForgotModal && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={() => setShowForgotModal(false)}
                        aria-label="Close modal"
                    >
                        <div 
                            ref={modalRef}
                            tabIndex={-1}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-200"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Modal Header */}
                            <div className="mb-6">
                                <h3 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    Reset Password
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={(e) => { e.preventDefault(); /* Handle submit */ }} className="space-y-5">
                                <div>
                                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                        required
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                    >
                                        Send Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </>
    );
}
