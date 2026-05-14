export interface User {
  id: number;
  fullName: string;
  bio: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
}

export interface LocationMedia {
  id?: number;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption?: string | null;
}

export interface Location {
  id: number;
  title: string;
  titleSq?: string | null;
  description: string;
  descriptionSq?: string | null;
  city: string;
  citySq?: string | null;
  address: string;
  addressSq?: string | null;
  latitude: number;
  longitude: number;
  categoryId: number;
  categoryName: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  media: LocationMedia[];
}

export interface PaginatedLocations {
  items: Location[];
  total: number;
}

export interface VisitRecord {
  id: number;
  visited_at: string;
  location_id: number;
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  category_name: string;
}

export interface VisitMilestone {
  threshold: number;
  achieved: boolean;
  remaining: number;
}

export interface VisitProgress {
  totalVisited: number;
  nextMilestone: number | null;
  milestones: VisitMilestone[];
}

export interface VisitedLocationsResponse {
  items: VisitRecord[];
  progress: VisitProgress;
}

export interface Review {
  id: number;
  userId: number;
  locationId: number;
  rating: number;
  body: string;
  createdAt: string;
  userName: string;
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
  average: number;
}
