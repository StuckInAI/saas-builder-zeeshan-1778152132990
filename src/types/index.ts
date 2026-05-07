export type Listing = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type ListingFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  status: 'active' | 'inactive';
};

export type AuthUser = {
  id: string;
  email: string;
};
