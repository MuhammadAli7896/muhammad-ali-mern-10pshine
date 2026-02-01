import { describe, it, expect, beforeEach } from 'vitest';
import apiClient from './apiClient';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is configured with base URL', () => {
    expect(apiClient.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
  });

  it('has credentials set to include', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('has interceptors configured', () => {
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });
});
