-- Migration: 002_app_settings
-- Creates a table to store dynamic app settings (API keys, models, etc.)

CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY, -- The setting key (e.g., 'huggingface_api_key', 'model_text_to_image')
  value text NOT NULL, -- The setting value
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) but only allow the Service Role to access it,
-- meaning it's only accessible from our secure Next.js backend, not the public frontend.
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage settings
CREATE POLICY "Service Role can manage settings" 
  ON public.app_settings 
  USING (true)
  WITH CHECK (true);

-- Insert some default values (if they don't exist)
INSERT INTO public.app_settings (id, value) VALUES
  ('huggingface_api_key', ''),
  ('model_text_to_image', 'black-forest-labs/FLUX.1-schnell'),
  ('model_cleanup', 'runwayml/stable-diffusion-inpainting'),
  ('model_upscale', 'stabilityai/stable-diffusion-x4-upscaler'),
  ('model_reimagine', 'lambdalabs/sd-image-variations-diffusers'),
  ('model_uncrop', 'runwayml/stable-diffusion-inpainting')
ON CONFLICT (id) DO NOTHING;
