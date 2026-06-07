import axios from 'axios';
import { API_BASE_URL } from '../config';

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/auth`,
  withCredentials: true,
});

export interface AuthTokens {
  access_token: string;
  username: string;
}

export async function login(username: string, password: string): Promise<AuthTokens> {
  const form = new URLSearchParams({ username, password });
  const res = await authClient.post<AuthTokens>('/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function refresh(): Promise<AuthTokens> {
  const res = await authClient.post<AuthTokens>('/refresh');
  return res.data;
}

export async function logout(): Promise<void> {
  await authClient.post('/logout');
}
