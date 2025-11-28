import axios from 'axios';
import { Platform } from 'react-native';
import { Festival, Product, ReviewRequest, ReviewResponse, ReservationResponse, User } from './types';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://127.0.0.1:8080');
const ML_BASE_URL =
  process.env.EXPO_PUBLIC_UNSMILE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8001' : 'http://127.0.0.1:8001');

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: 5000,
});

export const api = {
  signup: async (data: any): Promise<User> => {
    const res = await client.post<User>('/users/signup', data);
    return res.data;
  },
  login: async (data: any): Promise<User> => {
    const res = await client.post<User>('/users/login', data);
    return res.data;
  },
  updateUser: async (userId: number, data: any): Promise<User> => {
    const res = await client.put<User>(`/users/${userId}`, data);
    return res.data;
  },
  getFestivals: async (): Promise<Festival[]> => {
    const res = await client.get<Festival[]>('/festivals');
    return res.data;
  },
  getUpcomingFestivals: async (): Promise<Festival[]> => {
    const res = await client.get<Festival[]>('/festivals/upcoming');
    return res.data;
  },
  getFestival: async (id: number): Promise<Festival> => {
    const res = await client.get<Festival>(`/festivals/${id}`);
    return res.data;
  },
  getRecommendedFestivals: async (userId: number): Promise<Festival[]> => {
    const res = await client.get<Festival[]>(`/festivals/recommended`, { params: { userId } });
    return res.data;
  },
  createFestival: async (data: any): Promise<Festival> => {
    const res = await client.post<Festival>('/festivals', data);
    return res.data;
  },
  updateFestival: async (id: number, data: any): Promise<Festival> => {
    const res = await client.put<Festival>(`/festivals/${id}`, data);
    return res.data;
  },
  deleteFestival: async (id: number) => {
    await client.delete(`/festivals/${id}`);
  },
  // Activities (Products)
  getProducts: async () => {
    const res = await client.get('/products');
    return res.data;
  },
  getProduct: async (id: number) => {
    const res = await client.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: any) => {
    const res = await client.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: any) => {
    const res = await client.put(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: number) => {
    await client.delete(`/products/${id}`);
  },
  getFestivalProducts: async (festivalId: number): Promise<Product[]> => {
    const res = await client.get<Product[]>(`/festivals/${festivalId}/products`);
    return res.data;
  },
  getProducts: async (): Promise<Product[]> => {
    const res = await client.get<Product[]>('/products');
    return res.data;
  },
  getProduct: async (id: number): Promise<Product> => {
    const res = await client.get<Product>(`/products/${id}`);
    return res.data;
  },
  createReservation: async (data: any) => {
    const res = await client.post('/reservations', data);
    return res.data;
  },
  getReviewsByFestival: async (festivalId: number): Promise<ReviewResponse[]> => {
    const res = await client.get<ReviewResponse[]>(`/reviews/festival/${festivalId}`);
    return res.data;
  },
  getAllReviews: async (): Promise<ReviewResponse[]> => {
    const res = await client.get<ReviewResponse[]>('/reviews/all');
    return res.data;
  },
  checkReviewEligibility: async (userId: number, festivalId: number): Promise<boolean> => {
    const res = await client.get<boolean>('/reviews/eligible', { params: { userId, festivalId } });
    return res.data;
  },
  createReview: async (data: ReviewRequest): Promise<ReviewResponse> => {
    const res = await client.post<ReviewResponse>('/reviews', data);
    return res.data;
  },
  updateReview: async (reviewId: number, userId: number, data: ReviewRequest): Promise<ReviewResponse> => {
    const res = await client.put<ReviewResponse>(`/reviews/${reviewId}/${userId}`, data);
    return res.data;
  },
  deleteReview: async (reviewId: number, userId: number) => {
    await client.delete(`/reviews/${reviewId}/${userId}`);
  },
  deleteReviewAdmin: async (reviewId: number) => {
    await client.delete(`/reviews/${reviewId}`);
  },
  classifyText: async (text: string) => {
    const res = await mlClient.post('/classify', { text });
    return res.data as { label_id: number; label_name: string; score: number };
  },
  getAllReservations: async () => {
    const res = await client.get(`/reservations/all`);
    return res.data;
  },
  deleteReservationAdmin: async (reservationId: number) => {
    await client.delete(`/reservations/${reservationId}`);
  },

  // Reservations
  getReservationsByUser: async (userId: number): Promise<ReservationResponse[]> => {
    const res = await client.get<ReservationResponse[]>(`/reservations/user/${userId}`);
    return res.data;
  },
  getReservationCount: async (userId: number) => {
    const res = await client.get(`/reservations/count/${userId}`);
    return res.data;
  },
  markReservationAttended: async (reservationId: number) => {
    const res = await client.put(`/reservations/${reservationId}/attended`);
    return res.data;
  },
  cancelReservation: async (reservationId: number, userId: number) => {
    const res = await client.put(`/reservations/${reservationId}/cancel`, null, { params: { userId } });
    return res.data;
  },

  // Wishlist
  getWishlist: async (userId: number) => {
    const res = await client.get(`/wishlist/${userId}`);
    return res.data;
  },
  toggleWishlist: async (userId: number, festivalId: number) => {
    const res = await client.post(`/wishlist/${userId}/${festivalId}`);
    return res.data;
  },
  removeWishlist: async (userId: number, festivalId: number) => {
    await client.delete(`/wishlist/${userId}/${festivalId}`);
  },

  // Reviews
  getReviewsByUser: async (userId: number): Promise<ReviewResponse[]> => {
    const res = await client.get<ReviewResponse[]>(`/reviews/user/${userId}`);
    return res.data;
  },
};

export type ApiType = typeof api;
