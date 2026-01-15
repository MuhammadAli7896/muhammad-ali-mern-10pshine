import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to notes page
  if (isAuthenticated) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden px-4 py-8 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-8 lg:gap-12">
        
        {/* Left Section - Logo, Title, and Headline */}
        <div className="flex-1 space-y-4 md:space-y-6 lg:space-y-8 text-center lg:text-left">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <img 
              src="/logo.svg" 
              alt="ThinkNest Logo" 
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            ThinkNest
          </h1>

          {/* Headline */}
          <p className="text-base md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
            {isAuthenticated 
              ? `Welcome back, ${user?.name}! Ready to capture your ideas?`
              : 'Your thoughts, organized. Capture ideas, stay productive, and never miss a moment of inspiration.'
            }
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start pt-2 md:pt-4">
            {isAuthenticated ? (
              <Link
                to="/notes"
                className="px-6 py-3 md:px-8 md:py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Go to My Notes
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-6 py-3 md:px-8 md:py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 md:px-8 md:py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Features */}
        <div className="flex-1 space-y-4 md:space-y-5 lg:space-y-6 w-full">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">📝</div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-1 md:mb-2">
              Easy Note-Taking
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Create and organize your notes with a simple, intuitive interface.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔒</div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-1 md:mb-2">
              Secure & Private
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Your notes are encrypted and stored securely in the cloud.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">☁️</div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-1 md:mb-2">
              Cloud Sync
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Access your notes from anywhere, on any device, anytime.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
