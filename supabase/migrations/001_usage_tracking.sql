CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  fingerprint text NOT NULL,
  tool_name text NOT NULL,
  uses_count integer DEFAULT 0,
  first_used_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  is_paid boolean DEFAULT false,
  stripe_customer_id text,
  UNIQUE(ip_address, fingerprint, tool_name)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_lookup 
  ON usage_tracking(ip_address, fingerprint, tool_name);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_fingerprint
  ON usage_tracking(fingerprint);
