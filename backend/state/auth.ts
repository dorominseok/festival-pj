import { api } from '../api';
import { User } from '../api/types';

type Listener = (user: User | null) => void;

let currentUser: User | null = null;
const listeners: Listener[] = [];

const notify = () => listeners.forEach((cb) => cb(currentUser));

export const subscribe = (cb: Listener) => {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

export const getCurrentUser = () => currentUser;

export const loginWithEmail = async (email: string, password: string) => {
  const user = await api.login({ email, password });
  currentUser = user;
  notify();
  return user;
};

export const logout = () => {
  currentUser = null;
  notify();
};

export const setUser = (user: User | null) => {
  currentUser = user;
  notify();
};
