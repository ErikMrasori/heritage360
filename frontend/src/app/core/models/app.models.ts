export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
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
  description: string;
  city: string;
  address: string;
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
