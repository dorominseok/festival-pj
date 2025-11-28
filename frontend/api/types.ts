export interface Festival {
  id: number;
  festivalId?: number; // optional alias
  title: string;
  name?: string | null; // optional alias
  description: string;
  location: string;
  categories: string[];
  category?: string | null;
  averageRating?: number | null;
  lat?: number | null;
  lng?: number | null;
  imageUrl?: string | null;
  region: string;
  startDate: string;
  endDate: string;
  isWished?: boolean;
}

export interface Product {
  productId: number;
  festivalId: number;
  festivalName?: string | null;
  name: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  productType: string;
  imageUrl?: string | null;
  description?: string | null;
}

export interface ReviewResponse {
  reviewId: number;
  content: string;
  rating: number;
  userName?: string;
  userId: number;
  festivalId: number;
  festivalName?: string;
  reviewDate?: string;
  lastModified?: string;
  isToxic?: boolean;
  toxicity?: ToxicityResult;
}

export interface ReviewRequest {
  userId: number;
  festivalId: number;
  rating: number;
  content: string;
}

export interface ToxicityResult {
  labelId: number;
  labelName: string;
  score: number;
}

export interface ReservationResponse {
  reservationId: number;
  userId: number;
  festivalId: number;
  productId: number;
  festivalName?: string | null;
  productName?: string | null;
  product?: {
    productId: number;
    name?: string | null;
    imageUrl?: string | null;
    festival?: {
      festivalId: number;
      name?: string | null;
    };
  };
  date: string;
  time: string;
  headCount: number;
  status: string;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  interest?: string | null;
  interests?: string[];
  joinDate?: string;
  admin?: number;
}
