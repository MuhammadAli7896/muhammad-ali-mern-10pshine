import { Link } from 'react-router-dom';

export default function Notes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="NoteApp Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Notes</h1>
          </div>
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Logout
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 min-h-[600px] flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Your Notes Will Appear Here
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              This is a placeholder page. Soon you'll be able to create, edit, and organize all your notes here.
            </p>
            <div className="pt-4">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                Create Your First Note
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
