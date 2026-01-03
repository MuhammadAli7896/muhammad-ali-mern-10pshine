import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 px-4 py-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-6 lg:gap-12">

                    {/* Left Section - Form */}
                    <div className="w-full lg:w-1/2 max-w-md">
                        {/* Auth Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8">
                            {/* Form Title */}
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
                                Welcome Back!
                            </h2>

                            {/* Form */}
                            <form className="space-y-4 lg:space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm lg:text-base"
                                        required
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm lg:text-base pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 lg:py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm lg:text-base"
                                >
                                    Sign In
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-200">
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
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
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
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
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
