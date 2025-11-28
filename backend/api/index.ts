import axios from 'axios';
import {
  Festival,
  Product,
  ReservationRequest,
  ReservationResponse,
  ReviewRequest,
  ReviewResponse,
  SignupRequest,
  LoginRequest,
  User,
} from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const sanitizeInterests = (interests?: string[]) =>
  interests?.filter(Boolean) ?? [];

export const api = {
  signup: async (payload: SignupRequest): Promise<User> => {
    const res = await apiClient.post<User>('/users/signup', {
      ...payload,
      interests: sanitizeInterests(payload.interests),
    });
    return res.data;
  },

  login: async (payload: LoginRequest): Promise<User> => {
    const res = await apiClient.post<User>('/users/login', payload);
    return res.data;
  },

  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const res = await apiClient.get<User>(`/users/${userId}`);
    return res.data;
  },

  updateUser: async (userId: number, payload: Partial<SignupRequest>): Promise<User> => {
    const res = await apiClient.put<User>(`/users/${userId}`, {
      ...payload,
      interests: sanitizeInterests(payload.interests),
    });
    return res.data;
  },

  getFestivals: async (): Promise<Festival[]> => {
    const res = await apiClient.get<Festival[]>('/festivals');
    return res.data;
  },

  getFestival: async (id: number): Promise<Festival> => {
    const res = await apiClient.get<Festival>(`/festivals/${id}`);
    return res.data;
  },

  getProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>('/products');
    return res.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  getFestivalProducts: async (festivalId: number): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>(`/festivals/${festivalId}/products`);
    return res.data;
  },

  createReservation: async (payload: ReservationRequest): Promise<ReservationResponse> => {
    const res = await apiClient.post<ReservationResponse>('/reservations', payload);
    return res.data;
  },

  getReviews: async (): Promise<ReviewResponse[]> => {
    const res = await apiClient.get<ReviewResponse[]>('/reviews');
    return res.data;
  },

  getReviewsByFestival: async (festivalId: number): Promise<ReviewResponse[]> => {
    const res = await apiClient.get<ReviewResponse[]>(`/reviews/festival/${festivalId}`);
    return res.data;
  },

  createReview: async (payload: ReviewRequest): Promise<ReviewResponse> => {
    const res = await apiClient.post<ReviewResponse>('/reviews', payload);
    return res.data;
  },

  updateReview: async (reviewId: number, userId: number, payload: ReviewRequest): Promise<ReviewResponse> => {
    const res = await apiClient.put<ReviewResponse>(`/reviews/${reviewId}/${userId}`, payload);
    return res.data;
  },

  deleteReview: async (reviewId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}/${userId}`);
  },
};
