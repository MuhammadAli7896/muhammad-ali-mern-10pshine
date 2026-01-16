import apiClient from './apiClient';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    accessToken: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const authApi = {
  /**
   * Request a password reset token to be sent to the user's email
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify if a reset token is valid
   */
  verifyResetToken: async (token: string): Promise<VerifyTokenResponse> => {
    const response = await apiClient.post('/auth/verify-reset-token', { token });
    return response.data;
  },

  /**
   * Reset password using a valid token
   */
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default authApi;
