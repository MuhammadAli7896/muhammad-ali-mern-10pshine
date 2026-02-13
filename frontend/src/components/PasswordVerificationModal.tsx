import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import profileApi from '../lib/profileApi';
import toast from 'react-hot-toast';

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: PasswordVerificationModalProps) {
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle multiple characters typed (shouldn't happen normally, but just in case)
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newToken = [...token];
      digits.split('').forEach((char, i) => {
        if (index + i < 6) {
          newToken[index + i] = char;
        }
      });
      setToken(newToken);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(value) || value === '') {
      const newToken = [...token];
      newToken[index] = value;
      setToken(newToken);

      // Move to next input if value entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !token[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const tokenString = token.join('');
    
    if (tokenString.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await profileApi.verifyPasswordChange({ token: tokenString });
      
      // Save new access token
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      toast.success('Password changed successfully! You are still logged in.');
      onSuccess();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
      setToken(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setToken(['', '', '', '', '', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            We've sent a 6-digit verification code to your email.<br />
            Please enter it below to complete your password change.
          </p>
        </div>

        {/* Token Input */}
        <div className="flex justify-center gap-2 mb-6">
          {token.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
            ⏰ The code will expire in 10 minutes
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || token.some((d) => !d)}
          className="w-full px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Change Password'}
        </button>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Didn't receive the code? Check your spam folder or try again.
        </p>
      </div>
    </div>
  );
}
