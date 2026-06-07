import { apiClient } from './client';

export interface UserOut {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  isActive: boolean;
}

export interface UserCreate {
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}

export interface UserUpdate {
  password?: string;
  role?: 'admin' | 'viewer';
  isActive?: boolean;
}

export async function listUsers(): Promise<UserOut[]> {
  const res = await apiClient.get<UserOut[]>('/users/');
  return res.data;
}

export async function createUser(body: UserCreate): Promise<UserOut> {
  const res = await apiClient.post<UserOut>('/users/', body);
  return res.data;
}

export async function updateUser(id: string, body: UserUpdate): Promise<UserOut> {
  const res = await apiClient.patch<UserOut>(`/users/${id}`, body);
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
