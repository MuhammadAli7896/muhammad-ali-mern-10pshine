import apiClient from './apiClient';

export interface UpdateUsernameData {
  name: string;
}

export interface RequestPasswordChangeData {
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyPasswordChangeData {
  token: string;
}

const profileApi = {
  // Update username
  updateUsername: async (data: UpdateUsernameData) => {
    const response = await apiClient.put('/auth/profile/name', data);
    return response.data;
  },

  // Request password change (sends email)
  requestPasswordChange: async (data: RequestPasswordChangeData) => {
    const response = await apiClient.post('/auth/profile/change-password-request', data);
    return response.data;
  },

  // Verify password change token
  verifyPasswordChange: async (data: VerifyPasswordChangeData) => {
    const response = await apiClient.post('/auth/profile/verify-password-change', data);
    return response.data;
  },
};

export default profileApi;
