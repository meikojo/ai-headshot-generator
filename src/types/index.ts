export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  free_generations_used: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  input_image_url: string;
  output_image_url: string | null;
  style: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  stripe_session_id: string;
  credits_purchased: number;
  amount_paid: number;
  currency: string;
  created_at: string;
}

export interface GenerateRequest {
  imageUrl: string;
  style: string;
}

export interface GenerateResponse {
  resultUrl: string;
  id: string;
}

export interface CreditsResponse {
  credits: number;
  freeUsed: number;
}
