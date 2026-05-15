import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants/storage-keys';

interface AuthState {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN),
  email: localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL),
  login: (token, email) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, email);
    set({ token, email });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
    set({ token: null, email: null });
  },
}));
