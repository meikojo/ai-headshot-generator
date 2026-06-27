import { getServiceSupabase } from './supabase';

export interface AppSettings {
  huggingface_api_key: string;
  model_text_to_image: string;
  model_cleanup: string;
  model_upscale: string;
  model_reimagine: string;
  model_uncrop: string;
  inference_steps: string;
  cfg_scale: string;
  negative_prompt: string;
  width: string;
  height: string;
  rate_limit_free: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  huggingface_api_key: process.env.HUGGINGFACE_API_KEY || '',
  model_text_to_image: 'black-forest-labs/FLUX.1-schnell',
  model_cleanup: 'runwayml/stable-diffusion-inpainting',
  model_upscale: 'stabilityai/stable-diffusion-x4-upscaler',
  model_reimagine: 'lambdalabs/sd-image-variations-diffusers',
  model_uncrop: 'runwayml/stable-diffusion-inpainting',
  inference_steps: '20',
  cfg_scale: '7.5',
  negative_prompt: 'blurry, ugly, low quality',
  width: '1024',
  height: '1024',
  rate_limit_free: '10',
};

const isPlaceholderSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_project') || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

let mockDbSettings: AppSettings = { ...DEFAULT_SETTINGS };

// In-memory cache for settings to avoid querying DB on every single API call
let settingsCache: AppSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

export async function getAppSettings(forceRefresh = false): Promise<AppSettings> {
  if (isPlaceholderSupabase) {
    return mockDbSettings;
  }

  const now = Date.now();
  if (!forceRefresh && settingsCache && (now - lastFetchTime < CACHE_TTL)) {
    return settingsCache;
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from('app_settings').select('*');
    
    if (error) {
      console.warn('Error fetching settings from Supabase, using defaults:', error.message);
      return settingsCache || DEFAULT_SETTINGS;
    }

    const newSettings = { ...DEFAULT_SETTINGS };
    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (row.id in newSettings) {
          (newSettings as any)[row.id] = row.value;
        }
      }
    }

    settingsCache = newSettings;
    lastFetchTime = now;
    return newSettings;
  } catch (err) {
    console.warn('Failed to get app settings, using fallback.', err);
    return settingsCache || DEFAULT_SETTINGS;
  }
}

export async function updateAppSetting(id: keyof AppSettings, value: string): Promise<boolean> {
  if (isPlaceholderSupabase) {
    mockDbSettings[id] = value;
    return true;
  }

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id, value, updated_at: new Date().toISOString() });
    
    if (error) {
      console.error('Failed to update setting', error);
      return false;
    }

    // Invalidate cache
    if (settingsCache) {
      settingsCache[id] = value;
    }
    return true;
  } catch (err) {
    console.error('Failed to update app setting', err);
    return false;
  }
}
