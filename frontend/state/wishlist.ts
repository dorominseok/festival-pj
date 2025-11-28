import { api } from '../api';
import { Festival } from '../api/types';
import { getCurrentUser, subscribe as subscribeAuth } from './auth';

type Listener = (list: Festival[]) => void;

let wishlist: Festival[] = [];
const listeners: Listener[] = [];

const notify = () => {
  const copy = [...wishlist];
  listeners.forEach((cb) => cb(copy));
};

const loadFromServer = async (userId: number) => {
  try {
    const [wishlistDtos, festivals] = await Promise.all([api.getWishlist(userId), api.getFestivals()]);
    const map = new Map(festivals.map((f) => [f.id, f]));
    wishlist = wishlistDtos
      .map((w: any) => map.get(w.festivalId))
      .filter(Boolean) as Festival[];
    notify();
  } catch (e) {
    console.error('Failed to load wishlist from server', e);
  }
};

// Sync on auth changes
subscribeAuth((user) => {
  if (user) {
    loadFromServer(user.userId);
  } else {
    wishlist = [];
    notify();
  }
});

export const subscribe = (cb: Listener) => {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

export const getWishlist = () => [...wishlist];

export const isWishlisted = (festivalId: number) =>
  wishlist.some((item) => item.id === festivalId);

export const toggleWishlist = (festival: Festival) => {
  const exists = wishlist.find((f) => f.id === festival.id);
  if (exists) {
    wishlist = wishlist.filter((f) => f.id !== festival.id);
  } else {
    wishlist = [...wishlist, festival];
  }
  notify();

  const user = getCurrentUser();
  if (user) {
    api
      .toggleWishlist(user.userId, festival.id)
      .catch((e) => console.error('Wishlist toggle failed', e))
      .then(() => loadFromServer(user.userId));
  }

  return wishlist;
};

export const clearWishlist = () => {
  wishlist = [];
  notify();
};
