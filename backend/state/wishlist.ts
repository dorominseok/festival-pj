import { Festival } from '../api/types';

type Listener = (list: Festival[]) => void;

let wishlist: Festival[] = [];
const listeners: Listener[] = [];

const notify = () => listeners.forEach((cb) => cb([...wishlist]));

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
  return wishlist;
};

export const clearWishlist = () => {
  wishlist = [];
  notify();
};
