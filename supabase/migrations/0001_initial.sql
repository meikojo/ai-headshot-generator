CREATE TABLE usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  fingerprint text,
  uses_count int DEFAULT 0,
  is_paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (ip_address, fingerprint)
);
