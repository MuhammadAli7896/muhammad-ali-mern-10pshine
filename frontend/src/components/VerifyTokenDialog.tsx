import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Key } from 'lucide-react';
import authApi from '../lib/authApi';
import toast from 'react-hot-toast';

interface VerifyTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: (token: string) => void;
}

export default function VerifyTokenDialog({
  isOpen,
  onClose,
  email,
  onSuccess,
}: VerifyTokenDialogProps) {
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when dialog opens
  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !token[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const newToken = ['', '', '', '', '', ''];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) {
          newToken[i] = char;
        }
      });
      setToken(newToken);
      
      // Focus the last filled input or the last input if all 6 digits pasted
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tokenString = token.join('');

    if (tokenString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyResetToken(tokenString);
      toast.success('Token verified! You can now reset your password.');
      onSuccess(tokenString);
    } catch (error: any) {
      console.error('Verify token error:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired token');
      // Clear token on error
      setToken(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setToken(['', '', '', '', '', '']);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isComplete = token.every((digit) => digit !== '');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-600" />
              Verify Reset Token
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter the 6-digit token sent to <strong>{email}</strong>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Reset Token
            </label>
            
            {/* Token Input */}
            <div className="flex gap-2 justify-center">
              {token.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              ))}
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              The token will expire in 10 minutes
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isComplete}
              className="flex-1 px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Token'
              )}
            </button>
          </div>
        </form>

        {/* Help */}
        <div className="px-6 pb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>💡 Tip:</strong> Check your email inbox and spam folder for the token.
              You can paste the entire token at once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
