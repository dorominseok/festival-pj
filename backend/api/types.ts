export type ID = number | string;

export interface Festival {
  id: number;
  festivalId?: number;
  name?: string;
  title: string;
  description: string;
  location: string;
  categories: string[];
  category?: string;
  averageRating?: number | null;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  region: string;
  startDate: string;
  endDate: string;
  isWished?: boolean;
}

export interface Product {
  productId: number;
  festivalId: number;
  festivalName?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  productType: string;
  imageUrl?: string | null;
  description?: string | null;
}

export interface ReservationRequest {
  userId: number;
  festivalId: number;
  productId: number;
  discountRate?: number | null;
  date: string;
  time: string;
  headCount: number;
}

export interface ReservationResponse {
  reservationId: number;
  userId: number;
  festivalId: number;
  productId: number;
  discountRate?: number | null;
  reservationDate?: string | null;
  festivalName?: string;
  productName?: string | null;
  date: string;
  time: string;
  headCount: number;
  status: string;
}

export interface ReviewRequest {
  userId: number;
  festivalId: number;
  productId?: number | null;
  rating: number;
  content: string;
}

export interface ReviewResponse {
  reviewId: number;
  rating: number;
  content: string;
  reviewDate: string;
  lastModified: string;
  userId: number;
  userName?: string;
  festivalId: number;
  festivalName?: string;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  interest?: string | null;
  interests?: string[];
  joinDate?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}
